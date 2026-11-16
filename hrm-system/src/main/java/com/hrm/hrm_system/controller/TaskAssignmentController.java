package com.hrm.hrm_system.controller;

import com.hrm.hrm_system.dto.TaskStatusRequest;
import com.hrm.hrm_system.entity.TaskAssignment;
import com.hrm.hrm_system.service.TaskAssignmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ContentDisposition;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/task-assignments")
@CrossOrigin("*")
public class TaskAssignmentController {

    private final TaskAssignmentService service;

    public TaskAssignmentController(TaskAssignmentService service) {
        this.service = service;
    }

    @GetMapping
    public List<TaskAssignment> getAll(Authentication authentication) {
        return service.getAll(
                authentication.getName(),
                hasEmployeeRole(authentication));
    }

    @GetMapping("/{id}")
    public TaskAssignment getById(
            @PathVariable Long id,
            Authentication authentication) {
        return service.getById(
                id,
                authentication.getName(),
                hasEmployeeRole(authentication));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TaskAssignment create(
            @RequestBody TaskAssignment assignment,
            Authentication authentication) {
        return service.create(authentication.getName(), assignment);
    }

    @PutMapping("/{id}")
    public TaskAssignment update(
            @PathVariable Long id,
            @RequestBody TaskAssignment assignment) {
        return service.update(id, assignment);
    }

    @PatchMapping("/{id}/status")
    public TaskAssignment updateStatus(
            @PathVariable Long id,
            @RequestBody TaskStatusRequest request,
            Authentication authentication) {
        return service.updateStatus(
                id,
                request.getStatus(),
                authentication.getName(),
                hasEmployeeRole(authentication),
                null);
    }

    @PatchMapping(value = "/{id}/status", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public TaskAssignment updateStatusWithAttachment(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) MultipartFile file,
            Authentication authentication) {
        return service.updateStatus(
                id,
                status,
                authentication.getName(),
                hasEmployeeRole(authentication),
                file);
    }

    @GetMapping("/{id}/attachment")
    public ResponseEntity<byte[]> downloadAttachment(
            @PathVariable Long id,
            Authentication authentication) {
        TaskAssignment assignment = service.getAttachmentAssignment(
                id,
                authentication.getName(),
                hasEmployeeRole(authentication));

        if (!assignment.getHasAttachment()) {
            return ResponseEntity.notFound().build();
        }

        String contentType = assignment.getAttachmentContentType();
        MediaType mediaType;
        try {
            mediaType = contentType == null
                    ? MediaType.APPLICATION_OCTET_STREAM
                    : MediaType.parseMediaType(contentType);
        } catch (IllegalArgumentException exception) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(assignment.getAttachmentName())
                                .build()
                                .toString())
                .contentType(mediaType)
                .body(assignment.getAttachmentData());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    private boolean hasEmployeeRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_EMPLOYEE".equals(authority.getAuthority()));
    }
}
