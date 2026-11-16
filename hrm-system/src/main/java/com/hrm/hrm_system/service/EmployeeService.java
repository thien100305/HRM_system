package com.hrm.hrm_system.service;

import com.hrm.hrm_system.entity.Employee;
import com.hrm.hrm_system.repository.EmployeeRepository;
import com.hrm.hrm_system.repository.AttendanceRepository;
import com.hrm.hrm_system.repository.LeaveRequestRepository;
import com.hrm.hrm_system.repository.SalaryRepository;
import com.hrm.hrm_system.repository.UserRepository;
import com.hrm.hrm_system.repository.TaskAssignmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository repository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final SalaryRepository salaryRepository;
    private final UserRepository userRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;

    public EmployeeService(
            EmployeeRepository repository,
            AttendanceRepository attendanceRepository,
            LeaveRequestRepository leaveRequestRepository,
            SalaryRepository salaryRepository,
            UserRepository userRepository,
            TaskAssignmentRepository taskAssignmentRepository) {

        this.repository = repository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.salaryRepository = salaryRepository;
        this.userRepository = userRepository;
        this.taskAssignmentRepository = taskAssignmentRepository;
    }

    public List<Employee> getAllEmployees() {
        return repository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return repository.findById(id)
                .orElse(null);
    }

    private String generateEmployeeCode() {

        long sequence = repository.count() + 1;
        String employeeCode;

        do {
            employeeCode = String.format("NV%03d", sequence++);
        } while (repository.existsByEmployeeCode(employeeCode));

        return employeeCode;
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            return null;
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return null;
        }

        return phone.trim();
    }

    private void validateUniqueContact(Employee employee, Long currentEmployeeId) {
        String email = normalizeEmail(employee.getEmail());
        String phone = normalizePhone(employee.getPhone());

        boolean duplicatedEmail = email != null && (currentEmployeeId == null
                ? repository.existsByEmailIgnoreCase(email)
                : repository.existsByEmailIgnoreCaseAndIdNot(email, currentEmployeeId));

        if (duplicatedEmail) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email đã được sử dụng bởi nhân viên khác");
        }

        boolean duplicatedPhone = phone != null && (currentEmployeeId == null
                ? repository.existsByPhone(phone)
                : repository.existsByPhoneAndIdNot(phone, currentEmployeeId));

        if (duplicatedPhone) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Số điện thoại đã được sử dụng bởi nhân viên khác");
        }

        employee.setEmail(email);
        employee.setPhone(phone);
    }

    public Employee createEmployee(
            Employee employee) {

        validateUniqueContact(employee, null);

        if (employee.getEmployeeCode() == null
                || employee.getEmployeeCode().isEmpty()) {

            employee.setEmployeeCode(
                    generateEmployeeCode());
        }

        if (employee.getHireDate() == null) {

            employee.setHireDate(
                    LocalDate.now());
        }

        if (employee.getStatus() == null
                || employee.getStatus().isEmpty()) {

            employee.setStatus(
                    "Đang làm việc");
        }

        return repository.save(employee);
    }

    public Employee updateEmployee(
            Long id,
            Employee employee) {

        Employee existing = repository.findById(id)
                .orElse(null);

        if (existing == null) {
            return null;
        }

        validateUniqueContact(employee, id);

        existing.setFullName(
                employee.getFullName());

        existing.setGender(
                employee.getGender());

        existing.setDob(
                employee.getDob());

        existing.setPhone(
                employee.getPhone());

        existing.setEmail(
                employee.getEmail());

        existing.setAddress(
                employee.getAddress());

        existing.setDepartment(
                employee.getDepartment());

        existing.setPosition(
                employee.getPosition());

        existing.setSalary(
                employee.getSalary());

        existing.setHireDate(
                employee.getHireDate());

        existing.setStatus(
                employee.getStatus());

        return repository.save(
                existing);
    }

    public void deleteEmployee(Long id) {
        Employee employee = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy nhân viên"));

        // Thứ tự xóa phải tuân theo các khóa ngoại trỏ đến employees.
        // Toàn bộ phương thức chạy trong một transaction nên sẽ rollback nếu có lỗi.
        userRepository.deleteAllByEmployeeId(id);
        taskAssignmentRepository.deleteAllByEmployeeId(id);
        attendanceRepository.deleteAllByEmployeeId(id);
        leaveRequestRepository.deleteAllByEmployeeId(id);
        salaryRepository.deleteAllByEmployeeId(id);
        repository.delete(employee);
        repository.flush();
    }

}
