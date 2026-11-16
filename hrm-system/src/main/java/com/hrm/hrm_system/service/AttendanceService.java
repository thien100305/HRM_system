package com.hrm.hrm_system.service;

import com.hrm.hrm_system.entity.Attendance;
import com.hrm.hrm_system.entity.Employee;
import com.hrm.hrm_system.entity.LeaveRequest;
import com.hrm.hrm_system.dto.AttendanceMonthlySummary;
import com.hrm.hrm_system.repository.AttendanceRepository;
import com.hrm.hrm_system.repository.EmployeeRepository;
import com.hrm.hrm_system.repository.LeaveRequestRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.DayOfWeek;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;
import java.util.List;

@Service
@Transactional
public class AttendanceService {

    private final AttendanceRepository repository;
    private final AuthenticatedEmployeeService authenticatedEmployeeService;
    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;

    public AttendanceService(
            AttendanceRepository repository,
            AuthenticatedEmployeeService authenticatedEmployeeService,
            EmployeeRepository employeeRepository,
            LeaveRequestRepository leaveRequestRepository) {

        this.repository = repository;
        this.authenticatedEmployeeService = authenticatedEmployeeService;
        this.employeeRepository = employeeRepository;
        this.leaveRequestRepository = leaveRequestRepository;
    }

    @Transactional(readOnly = true)
    public List<Attendance> getAllAttendance(
            String username,
            boolean employeeRole) {

        if (employeeRole) {
            Employee employee = authenticatedEmployeeService.getRequiredEmployee(username);
            return repository.findByEmployeeIdOrderByAttendanceDateDesc(employee.getId());
        }

        return repository.findAll(Sort.by(Sort.Direction.DESC, "attendanceDate"));
    }

    @Transactional(readOnly = true)
    public Attendance getAttendanceById(
            Long id,
            String username,
            boolean employeeRole) {

        Attendance attendance = requireAttendance(id);

        if (employeeRole) {
            Employee employee = authenticatedEmployeeService.getRequiredEmployee(username);
            requireOwner(attendance, employee);
        }

        return attendance;
    }

    public Attendance createAttendance(Attendance attendance) {
        Long employeeId = attendance.getEmployee() == null
                ? null
                : attendance.getEmployee().getId();

        if (employeeId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vui lòng chọn nhân viên");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy nhân viên"));

        validateAttendance(attendance);

        if (repository.existsByEmployeeIdAndAttendanceDate(
                employee.getId(),
                attendance.getAttendanceDate())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Nhân viên đã chấm công trong ngày này");
        }

        attendance.setId(null);
        attendance.setEmployee(employee);
        attendance.setStatus(determineStatus(
                attendance.getCheckIn(),
                attendance.getCheckOut()));

        return repository.save(attendance);
    }

    @Transactional(readOnly = true)
    public AttendanceMonthlySummary getMonthlySummary(
            String username,
            int month,
            int year) {

        if (month < 1 || month > 12 || year < 2000 || year > 2100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tháng hoặc năm không hợp lệ");
        }

        Employee employee = authenticatedEmployeeService.getRequiredEmployee(username);
        YearMonth selectedMonth = YearMonth.of(year, month);
        LocalDate start = selectedMonth.atDay(1);
        LocalDate end = selectedMonth.atEndOfMonth();
        LocalDate today = LocalDate.now();

        if (start.isAfter(today)) {
            return new AttendanceMonthlySummary(
                    month, year, 0, 0, BigDecimal.ZERO, BigDecimal.ZERO);
        }
        if (end.isAfter(today)) {
            end = today;
        }

        Set<LocalDate> workedDates = new HashSet<>();
        for (Attendance attendance : repository
                .findByEmployeeIdAndAttendanceDateBetween(employee.getId(), start, end)) {
            if (attendance.getCheckIn() != null) {
                workedDates.add(attendance.getAttendanceDate());
            }
        }

        int scheduledDays = 0;
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            if (date.getDayOfWeek() != DayOfWeek.SUNDAY) {
                scheduledDays++;
            }
        }

        Set<LocalDate> fullLeaveDates = new HashSet<>();
        Set<LocalDate> halfLeaveDates = new HashSet<>();
        List<LeaveRequest> approvedLeaves = leaveRequestRepository
                .findByEmployeeIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        employee.getId(), "Approved", end, start);

        for (LeaveRequest leave : approvedLeaves) {
            LocalDate leaveStart = leave.getStartDate().isBefore(start) ? start : leave.getStartDate();
            LocalDate leaveEnd = leave.getEndDate().isAfter(end) ? end : leave.getEndDate();
            for (LocalDate date = leaveStart; !date.isAfter(leaveEnd); date = date.plusDays(1)) {
                if (date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                    continue;
                }
                if (leave.isHalfDay()) {
                    halfLeaveDates.add(date);
                } else {
                    fullLeaveDates.add(date);
                }
            }
        }

        halfLeaveDates.removeAll(fullLeaveDates);
        BigDecimal approvedLeaveDays = BigDecimal.valueOf(fullLeaveDates.size())
                .add(BigDecimal.valueOf(halfLeaveDates.size())
                        .multiply(new BigDecimal("0.5")));

        BigDecimal absentDays = BigDecimal.ZERO;
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            if (date.getDayOfWeek() == DayOfWeek.SUNDAY) {
                continue;
            }
            if (!workedDates.contains(date)) {
                absentDays = absentDays.add(BigDecimal.ONE);
            } else if (halfLeaveDates.contains(date)) {
                absentDays = absentDays.add(new BigDecimal("0.5"));
            }
        }

        return new AttendanceMonthlySummary(
                month,
                year,
                scheduledDays,
                workedDates.size(),
                absentDays,
                approvedLeaveDays);
    }

    private void validateAttendance(Attendance attendance) {
        if (attendance.getAttendanceDate() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ngày chấm công là bắt buộc");
        }

        if (attendance.getAttendanceDate().isAfter(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Không thể chấm công cho ngày trong tương lai");
        }

        if (attendance.getCheckIn() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Giờ vào là bắt buộc");
        }

        if (attendance.getCheckOut() != null
                && attendance.getCheckOut().isBefore(attendance.getCheckIn())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Giờ ra không được trước giờ vào");
        }
    }

    public Attendance updateAttendance(
            Long id,
            Attendance attendance) {

        Attendance existing = requireAttendance(id);
        existing.setAttendanceDate(attendance.getAttendanceDate());
        existing.setCheckIn(attendance.getCheckIn());
        existing.setCheckOut(attendance.getCheckOut());
        existing.setEmployee(attendance.getEmployee());
        existing.setStatus(determineStatus(
                attendance.getCheckIn(),
                attendance.getCheckOut()));

        return repository.save(existing);
    }

    public void deleteAttendance(Long id) {
        repository.delete(requireAttendance(id));
    }

    private Attendance requireAttendance(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy dữ liệu chấm công"));
    }

    private void requireOwner(
            Attendance attendance,
            Employee employee) {

        if (attendance.getEmployee() == null
                || !employee.getId().equals(attendance.getEmployee().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bạn không có quyền xem dữ liệu chấm công này");
        }
    }

    private String determineStatus(
            LocalTime checkIn,
            LocalTime checkOut) {

        if (checkIn == null) {
            return "Nghỉ";
        }

        LocalTime startTime = LocalTime.of(8, 0);
        LocalTime endTime = LocalTime.of(17, 0);

        if (checkIn.isAfter(startTime)) {
            return "Đi muộn";
        }

        if (checkOut != null && checkOut.isBefore(endTime)) {
            return "Về sớm";
        }

        return "Đi làm";
    }
}
