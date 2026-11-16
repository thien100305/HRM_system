package com.hrm.hrm_system.controller;

import com.hrm.hrm_system.entity.LeaveRequest;
import com.hrm.hrm_system.service.LeaveRequestService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave-requests")
@CrossOrigin("*")
public class LeaveRequestController {

    private final LeaveRequestService service;

    public LeaveRequestController(
            LeaveRequestService service) {

        this.service = service;
    }

    @GetMapping
    public List<LeaveRequest> getAll(Authentication authentication) {
        return service.getAll(
                authentication.getName(),
                hasRole(authentication, "ROLE_EMPLOYEE"));
    }

    @GetMapping("/{id}")
    public LeaveRequest getById(
            @PathVariable Long id,
            Authentication authentication) {

        return service.getById(
                id,
                authentication.getName(),
                hasRole(authentication, "ROLE_EMPLOYEE"));
    }

    @PostMapping
    public LeaveRequest create(
            @RequestBody LeaveRequest leaveRequest,
            Authentication authentication) {

        return service.create(
                authentication.getName(),
                leaveRequest);
    }

    @PutMapping("/{id}")
    public LeaveRequest update(
            @PathVariable Long id,
            @RequestBody LeaveRequest leaveRequest,
            Authentication authentication) {

        return service.update(
                id,
                authentication.getName(),
                leaveRequest);
    }

    @PutMapping("/{id}/approve")
    public LeaveRequest approveLeave(
            @PathVariable Long id) {

        return service.approveLeave(id);
    }

    @PutMapping("/{id}/reject")
    public LeaveRequest rejectLeave(
            @PathVariable Long id) {

        return service.rejectLeave(id);
    }

    @DeleteMapping("/{id}")
    public String delete(
            @PathVariable Long id) {

        service.delete(id);

        return "Delete Success";
    }

    private boolean hasRole(
            Authentication authentication,
            String role) {

        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals(role));
    }

}
