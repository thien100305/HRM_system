package com.hrm.hrm_system.dto;

import java.math.BigDecimal;

public record AttendanceMonthlySummary(
        int month,
        int year,
        int scheduledDays,
        int workedDays,
        BigDecimal absentDays,
        BigDecimal approvedLeaveDays) {
}
