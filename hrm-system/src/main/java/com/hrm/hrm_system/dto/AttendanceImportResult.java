package com.hrm.hrm_system.dto;

import java.util.List;

public record AttendanceImportResult(
        int totalRows,
        int imported,
        int skipped,
        List<AttendanceImportError> errors) {
}
