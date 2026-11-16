package com.hrm.hrm_system.service;

import com.hrm.hrm_system.entity.Employee;
import com.hrm.hrm_system.entity.LeaveRequest;
import com.hrm.hrm_system.entity.User;
import com.hrm.hrm_system.repository.LeaveRequestRepository;
import com.hrm.hrm_system.repository.UserRepository;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class LeaveRequestService {

    private final LeaveRequestRepository repository;
    private final UserRepository userRepository;

    public LeaveRequestService(
            LeaveRequestRepository repository,
            UserRepository userRepository) {

        this.repository = repository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<LeaveRequest> getAll(
            String username,
            boolean employeeRole) {

        if (employeeRole) {
            Employee employee = requireEmployee(username);
            return repository.findByEmployeeIdOrderByStartDateDesc(employee.getId());
        }

        return repository.findAll(Sort.by(Sort.Direction.DESC, "startDate"));
    }

    @Transactional(readOnly = true)
    public LeaveRequest getById(
            Long id,
            String username,
            boolean employeeRole) {

        LeaveRequest leaveRequest = requireLeaveRequest(id);

        if (employeeRole) {
            Employee employee = requireEmployee(username);
            requireOwner(leaveRequest, employee);
        }

        return leaveRequest;
    }

    public LeaveRequest create(
            String username,
            LeaveRequest leaveRequest) {

        validateDates(leaveRequest);

        // Không tin employee/status do client gửi lên. Chủ đơn luôn là tài khoản
        // nhân viên đang đăng nhập và đơn mới luôn ở trạng thái chờ duyệt.
        leaveRequest.setId(null);
        leaveRequest.setEmployee(requireEmployee(username));
        leaveRequest.setStatus("Pending");

        return repository.save(leaveRequest);
    }

    public LeaveRequest update(
            Long id,
            String username,
            LeaveRequest changes) {

        LeaveRequest existing = requireLeaveRequest(id);
        Employee employee = requireEmployee(username);
        requireOwner(existing, employee);

        if (!"Pending".equals(existing.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Chỉ có thể sửa đơn đang chờ duyệt");
        }

        validateDates(changes);
        existing.setStartDate(changes.getStartDate());
        existing.setEndDate(changes.getEndDate());
        existing.setReason(changes.getReason());
        existing.setLeaveSession(changes.getLeaveSession());

        return repository.save(existing);
    }

    public LeaveRequest approveLeave(Long id) {
        return changeStatus(id, "Approved");
    }

    public LeaveRequest rejectLeave(Long id) {
        return changeStatus(id, "Rejected");
    }

    public void delete(Long id) {
        repository.delete(requireLeaveRequest(id));
    }

    private LeaveRequest changeStatus(
            Long id,
            String status) {

        LeaveRequest leaveRequest = requireLeaveRequest(id);

        if (!"Pending".equals(leaveRequest.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Đơn này đã được xử lý");
        }

        leaveRequest.setStatus(status);
        return repository.save(leaveRequest);
    }

    private void validateDates(LeaveRequest leaveRequest) {
        String leaveSession = leaveRequest.getLeaveSession();
        if (!List.of("FULL_DAY", "MORNING", "AFTERNOON").contains(leaveSession)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Buổi nghỉ không hợp lệ");
        }

        if (leaveRequest.getStartDate() == null || leaveRequest.getEndDate() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ngày bắt đầu và ngày kết thúc là bắt buộc");
        }

        if (leaveRequest.getStartDate().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ngày bắt đầu không được nhỏ hơn ngày hiện tại");
        }

        if (leaveRequest.getEndDate().isBefore(leaveRequest.getStartDate())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ngày kết thúc không được trước ngày bắt đầu");
        }


        if (leaveRequest.isHalfDay()
                && !leaveRequest.getStartDate().equals(leaveRequest.getEndDate())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nghỉ nửa buổi chỉ áp dụng trong một ngày");
        }
    }

    private User requireUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Không tìm thấy tài khoản đăng nhập"));
    }

    private Employee requireEmployee(String username) {
        Employee employee = requireUser(username).getEmployee();

        if (employee == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Tài khoản nhân viên chưa được liên kết với hồ sơ nhân viên");
        }

        return employee;
    }

    private LeaveRequest requireLeaveRequest(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy đơn nghỉ phép"));
    }

    private void requireOwner(
            LeaveRequest leaveRequest,
            Employee employee) {

        if (leaveRequest.getEmployee() == null
                || !employee.getId().equals(leaveRequest.getEmployee().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bạn không có quyền truy cập đơn nghỉ phép này");
        }
    }
}
