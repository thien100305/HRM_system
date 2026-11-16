package com.hrm.hrm_system.dto;

public record AttendanceImportError(
        int row,
        String message) {
}
