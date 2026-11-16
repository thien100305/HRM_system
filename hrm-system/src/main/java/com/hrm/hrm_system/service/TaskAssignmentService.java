package com.hrm.hrm_system.service;

import com.hrm.hrm_system.entity.Employee;
import com.hrm.hrm_system.entity.TaskAssignment;
import com.hrm.hrm_system.repository.EmployeeRepository;
import com.hrm.hrm_system.repository.TaskAssignmentRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class TaskAssignmentService {

    private static final long MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

    private static final List<String> STATUSES = List.of("TODO", "IN_PROGRESS", "COMPLETED");
    private static final List<String> PRIORITIES = List.of("LOW", "MEDIUM", "HIGH");

    private final TaskAssignmentRepository repository;
    private final EmployeeRepository employeeRepository;
    private final AuthenticatedEmployeeService authenticatedEmployeeService;

    public TaskAssignmentService(
            TaskAssignmentRepository repository,
            EmployeeRepository employeeRepository,
            AuthenticatedEmployeeService authenticatedEmployeeService) {

        this.repository = repository;
        this.employeeRepository = employeeRepository;
        this.authenticatedEmployeeService = authenticatedEmployeeService;
    }

    @Transactional(readOnly = true)
    public List<TaskAssignment> getAll(String username, boolean employeeRole) {
        if (employeeRole) {
            Employee employee = authenticatedEmployeeService.getRequiredEmployee(username);
            return repository.findByEmployeeIdOrderByDueDateAsc(employee.getId());
        }

        return repository.findAll(Sort.by(
                Sort.Order.asc("status"),
                Sort.Order.asc("dueDate")));
    }

    @Transactional(readOnly = true)
    public TaskAssignment getById(Long id, String username, boolean employeeRole) {
        TaskAssignment assignment = requireAssignment(id);
        if (employeeRole) {
            requireOwner(assignment, authenticatedEmployeeService.getRequiredEmployee(username));
        }
        return assignment;
    }

    public TaskAssignment create(String assignedBy, TaskAssignment request) {
        validate(request);

        TaskAssignment assignment = new TaskAssignment();
        applyChanges(assignment, request);
        assignment.setStatus("TODO");
        assignment.setAssignedBy(assignedBy);

        return repository.save(assignment);
    }

    public TaskAssignment update(Long id, TaskAssignment request) {
        validate(request);

        TaskAssignment assignment = requireAssignment(id);
        applyChanges(assignment, request);
        assignment.setStatus(normalizeStatus(request.getStatus()));

        return repository.save(assignment);
    }

    public TaskAssignment updateStatus(
            Long id,
            String requestedStatus,
            String username,
            boolean employeeRole,
            MultipartFile attachment) {

        TaskAssignment assignment = requireAssignment(id);
        if (employeeRole) {
            requireOwner(assignment, authenticatedEmployeeService.getRequiredEmployee(username));
        }

        String status = normalizeStatus(requestedStatus);
        if (employeeRole && "COMPLETED".equals(status)) {
            if ((attachment == null || attachment.isEmpty())
                    && !assignment.getHasAttachment()) {
                throw badRequest("Vui lòng đính kèm file minh chứng khi hoàn thành công việc");
            }
            if (attachment != null && !attachment.isEmpty()) {
                saveAttachment(assignment, attachment);
            }
        }

        assignment.setStatus(status);
        return repository.save(assignment);
    }

    @Transactional(readOnly = true)
    public TaskAssignment getAttachmentAssignment(
            Long id,
            String username,
            boolean employeeRole) {
        return getById(id, username, employeeRole);
    }

    private void saveAttachment(TaskAssignment assignment, MultipartFile attachment) {
        if (attachment.getSize() > MAX_ATTACHMENT_SIZE) {
            throw badRequest("File đính kèm không được vượt quá 10 MB");
        }

        String originalName = attachment.getOriginalFilename();
        String safeName = originalName == null ? "minh-chung" : originalName.replace("\\", "/");
        safeName = safeName.substring(safeName.lastIndexOf('/') + 1).trim();
        if (safeName.isBlank()) {
            safeName = "minh-chung";
        }
        if (safeName.length() > 255) {
            safeName = safeName.substring(safeName.length() - 255);
        }

        try {
            assignment.setAttachmentData(attachment.getBytes());
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Không thể đọc file đính kèm",
                    exception);
        }
        assignment.setAttachmentName(safeName);
        assignment.setAttachmentContentType(attachment.getContentType());
        assignment.setAttachmentUploadedAt(LocalDateTime.now());
    }

    public void delete(Long id) {
        repository.delete(requireAssignment(id));
    }

    private void applyChanges(TaskAssignment assignment, TaskAssignment request) {
        Long employeeId = request.getEmployee() == null
                ? null
                : request.getEmployee().getId();
        if (employeeId == null) {
            throw badRequest("Vui lòng chọn nhân viên nhận việc");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy nhân viên"));

        assignment.setTitle(request.getTitle().trim());
        assignment.setDescription(
                request.getDescription() == null ? null : request.getDescription().trim());
        assignment.setStartDate(request.getStartDate());
        assignment.setDueDate(request.getDueDate());
        assignment.setPriority(normalizePriority(request.getPriority()));
        assignment.setEmployee(employee);
    }

    private void validate(TaskAssignment request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw badRequest("Tên công việc là bắt buộc");
        }
        if (request.getTitle().trim().length() > 200) {
            throw badRequest("Tên công việc không được vượt quá 200 ký tự");
        }
        if (request.getStartDate() == null || request.getDueDate() == null) {
            throw badRequest("Ngày bắt đầu và hạn hoàn thành là bắt buộc");
        }
        if (request.getDueDate().isBefore(request.getStartDate())) {
            throw badRequest("Hạn hoàn thành không được trước ngày bắt đầu");
        }
    }

    private String normalizeStatus(String status) {
        String normalized = status == null
                ? "TODO"
                : status.trim().toUpperCase(Locale.ROOT);
        if (!STATUSES.contains(normalized)) {
            throw badRequest("Trạng thái công việc không hợp lệ");
        }
        return normalized;
    }

    private String normalizePriority(String priority) {
        String normalized = priority == null
                ? "MEDIUM"
                : priority.trim().toUpperCase(Locale.ROOT);
        if (!PRIORITIES.contains(normalized)) {
            throw badRequest("Mức ưu tiên không hợp lệ");
        }
        return normalized;
    }

    private TaskAssignment requireAssignment(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy công việc"));
    }

    private void requireOwner(TaskAssignment assignment, Employee employee) {
        if (assignment.getEmployee() == null
                || !employee.getId().equals(assignment.getEmployee().getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bạn không có quyền cập nhật công việc này");
        }
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
