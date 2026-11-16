package com.hrm.hrm_system.dto;

import com.hrm.hrm_system.entity.Employee;
import com.hrm.hrm_system.entity.User;

public record AccountResponse(
        Long id,
        String username,
        String role,
        Long employeeId,
        String employeeCode,
        String employeeName) {

    public static AccountResponse from(User user) {
        Employee employee = user.getEmployee();
        String roleName = user.getRole() == null
                ? ""
                : user.getRole().getName().replace("ROLE_", "");

        return new AccountResponse(
                user.getId(),
                user.getUsername(),
                roleName,
                employee == null ? null : employee.getId(),
                employee == null ? null : employee.getEmployeeCode(),
                employee == null ? null : employee.getFullName());
    }
}
