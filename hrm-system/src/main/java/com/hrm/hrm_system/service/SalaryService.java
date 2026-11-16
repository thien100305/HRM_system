package com.hrm.hrm_system.service;

import com.hrm.hrm_system.entity.Attendance;
import com.hrm.hrm_system.entity.Employee;
import com.hrm.hrm_system.entity.LeaveRequest;
import com.hrm.hrm_system.entity.Salary;
import com.hrm.hrm_system.repository.AttendanceRepository;
import com.hrm.hrm_system.repository.EmployeeRepository;
import com.hrm.hrm_system.repository.LeaveRequestRepository;
import com.hrm.hrm_system.repository.SalaryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class SalaryService {

    private final SalaryRepository salaryRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final AuthenticatedEmployeeService authenticatedEmployeeService;
    private final int standardWorkingDays;
    private final BigDecimal attendanceBonusAmount;
    private final BigDecimal latePenaltyPerDay;
    private final LocalTime workStartTime;

    public SalaryService(
            SalaryRepository salaryRepository,
            EmployeeRepository employeeRepository,
            AttendanceRepository attendanceRepository,
            LeaveRequestRepository leaveRequestRepository,
            AuthenticatedEmployeeService authenticatedEmployeeService,
            @Value("${hrm.salary.standard-working-days:26}") int standardWorkingDays,
            @Value("${hrm.salary.attendance-bonus:500000}") BigDecimal attendanceBonusAmount,
            @Value("${hrm.salary.late-penalty-per-day:100000}") BigDecimal latePenaltyPerDay,
            @Value("${hrm.salary.work-start-time:08:00}") String workStartTime) {

        this.salaryRepository = salaryRepository;
        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.authenticatedEmployeeService = authenticatedEmployeeService;
        this.standardWorkingDays = standardWorkingDays;
        this.attendanceBonusAmount = attendanceBonusAmount;
        this.latePenaltyPerDay = latePenaltyPerDay;
        this.workStartTime = LocalTime.parse(workStartTime);
    }

    @Transactional(readOnly = true)
    public List<Salary> getAllSalary(
            String username,
            boolean employeeRole) {

        if (employeeRole) {
            Employee employee = authenticatedEmployeeService.getRequiredEmployee(username);
            return salaryRepository.findByEmployeeIdOrderByYearDescMonthDesc(employee.getId());
        }

        return salaryRepository.findAll(Sort.by(
                Sort.Order.desc("year"),
                Sort.Order.desc("month")));
    }

    @Transactional(readOnly = true)
    public Salary getSalaryById(
            Long id,
            String username,
            boolean employeeRole) {

        Salary salary = requireSalary(id);

        if (employeeRole) {
            Employee employee = authenticatedEmployeeService.getRequiredEmployee(username);
            requireOwner(salary, employee);
        }

        return salary;
    }

    public List<Salary> generateMonthlySalaries(
            int month,
            int year) {

        validatePeriod(month, year);

        List<Salary> salaries = employeeRepository.findAll().stream()
                .filter(employee -> employee.getSalary() != null)
                .filter(employee -> employee.getSalary().compareTo(BigDecimal.ZERO) > 0)
                .map(employee -> {
                    Salary salary = salaryRepository
                            .findByEmployeeIdAndMonthAndYear(employee.getId(), month, year)
                            .orElseGet(Salary::new);

                    BigDecimal allowance = salary.getAllowance() == null
                            ? BigDecimal.ZERO
                            : salary.getAllowance();

                    calculate(salary, employee, month, year, allowance);
                    return salary;
                })
                .toList();

        return salaryRepository.saveAll(salaries);
    }

    /**
     * Tạo bảng lương một nhân viên nhưng mọi số liệu ngày công vẫn lấy từ hệ thống.
     */
    public Salary createSalary(Salary request) {
        Employee employee = requireEmployee(request);
        validatePeriod(request.getMonth(), request.getYear());

        Salary salary = salaryRepository
                .findByEmployeeIdAndMonthAndYear(
                        employee.getId(),
                        request.getMonth(),
                        request.getYear())
                .orElseGet(Salary::new);

        calculate(
                salary,
                employee,
                request.getMonth(),
                request.getYear(),
                defaultZero(request.getAllowance()));

        return salaryRepository.save(salary);
    }

    /** Khi sửa chỉ nhận phụ cấp; các trường còn lại luôn được tính lại. */
    public Salary updateSalary(
            Long id,
            Salary request) {

        Salary existing = requireSalary(id);
        calculate(
                existing,
                existing.getEmployee(),
                existing.getMonth(),
                existing.getYear(),
                defaultZero(request.getAllowance()));

        return salaryRepository.save(existing);
    }

    public void deleteSalary(Long id) {
        salaryRepository.delete(requireSalary(id));
    }

    /** Tự động tạo bảng lương tháng trước lúc 00:05 ngày đầu mỗi tháng. */
    @Scheduled(cron = "0 5 0 1 * *")
    public void generatePreviousMonthAutomatically() {
        YearMonth previousMonth = YearMonth.now().minusMonths(1);
        generateMonthlySalaries(
                previousMonth.getMonthValue(),
                previousMonth.getYear());
    }

    private void calculate(
            Salary salary,
            Employee employee,
            int month,
            int year,
            BigDecimal allowance) {

        if (employee.getSalary() == null || employee.getSalary().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Nhân viên chưa có lương cơ bản hợp lệ");
        }

        YearMonth period = YearMonth.of(year, month);
        LocalDate periodStart = period.atDay(1);
        LocalDate periodEnd = period.atEndOfMonth();

        List<Attendance> attendanceRecords = attendanceRepository
                .findByEmployeeIdAndAttendanceDateBetween(
                        employee.getId(),
                        periodStart,
                        periodEnd);

        Set<LocalDate> workedDates = new HashSet<>();
        int lateDays = 0;

        for (Attendance attendance : attendanceRecords) {
            if (attendance.getCheckIn() == null) {
                continue;
            }

            workedDates.add(attendance.getAttendanceDate());
            if (attendance.getCheckIn().isAfter(workStartTime)) {
                lateDays++;
            }
        }

        int workingDays = workedDates.size();
        BigDecimal leaveDays = countApprovedLeaveDays(
                employee.getId(),
                periodStart,
                periodEnd,
                workedDates);
        BigDecimal paidDays = BigDecimal.valueOf(workingDays)
                .add(leaveDays)
                .min(BigDecimal.valueOf(standardWorkingDays));

        BigDecimal attendanceBonus = workingDays >= standardWorkingDays && lateDays == 0
                ? attendanceBonusAmount
                : BigDecimal.ZERO;
        BigDecimal latePenalty = latePenaltyPerDay.multiply(BigDecimal.valueOf(lateDays));
        BigDecimal dailySalary = employee.getSalary().divide(
                BigDecimal.valueOf(standardWorkingDays),
                10,
                RoundingMode.HALF_UP);
        BigDecimal totalSalary = dailySalary
                .multiply(paidDays)
                .add(allowance)
                .add(attendanceBonus)
                .subtract(latePenalty)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        salary.setEmployee(employee);
        salary.setMonth(month);
        salary.setYear(year);
        salary.setBasicSalary(employee.getSalary());
        salary.setAllowance(allowance);
        salary.setWorkingDays(workingDays);
        salary.setLeaveDays(leaveDays);
        salary.setLateDays(lateDays);
        salary.setAttendanceBonus(attendanceBonus);
        salary.setLatePenalty(latePenalty);
        salary.setTotalSalary(totalSalary);
    }

    private BigDecimal countApprovedLeaveDays(
            Long employeeId,
            LocalDate periodStart,
            LocalDate periodEnd,
            Set<LocalDate> workedDates) {

        List<LeaveRequest> approvedLeaves = leaveRequestRepository
                .findByEmployeeIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        employeeId,
                        "Approved",
                        periodEnd,
                        periodStart);

        Set<LocalDate> fullDayLeaveDates = new HashSet<>();
        Set<LocalDate> halfDayLeaveDates = new HashSet<>();

        for (LeaveRequest leave : approvedLeaves) {
            LocalDate start = leave.getStartDate().isBefore(periodStart)
                    ? periodStart
                    : leave.getStartDate();
            LocalDate end = leave.getEndDate().isAfter(periodEnd)
                    ? periodEnd
                    : leave.getEndDate();

            for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
                if (isWorkday(date) && !workedDates.contains(date)) {
                    if (leave.isHalfDay()) {
                        halfDayLeaveDates.add(date);
                    } else {
                        fullDayLeaveDates.add(date);
                    }
                }
            }
        }

        halfDayLeaveDates.removeAll(fullDayLeaveDates);
        return BigDecimal.valueOf(fullDayLeaveDates.size())
                .add(BigDecimal.valueOf(halfDayLeaveDates.size())
                        .multiply(new BigDecimal("0.5")));
    }

    private boolean isWorkday(LocalDate date) {
        // Công thức 26 ngày/tháng tương ứng lịch làm việc từ thứ Hai đến thứ Bảy.
        return date.getDayOfWeek() != DayOfWeek.SUNDAY;
    }

    private Employee requireEmployee(Salary salary) {
        if (salary.getEmployee() == null || salary.getEmployee().getId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nhân viên là bắt buộc");
        }

        return employeeRepository.findById(salary.getEmployee().getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy nhân viên"));
    }

    private Salary requireSalary(Long id) {
        return salaryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy bảng lương"));
    }

    private void requireOwner(
            Salary salary,
            Employee employee) {

        if (salary.getEmployee() == null
                || !employee.getId().equals(salary.getEmployee().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bạn không có quyền xem bảng lương này");
        }
    }

    private void validatePeriod(Integer month, Integer year) {
        if (month == null || month < 1 || month > 12) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tháng phải nằm trong khoảng từ 1 đến 12");
        }

        if (year == null || year < 2000 || year > 2100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Năm không hợp lệ");
        }
    }

    private BigDecimal defaultZero(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
