package com.hrm.hrm_system.dto;

import java.math.BigDecimal;

public record MonthlySalaryStat(
        Integer year,
        Integer month,
        BigDecimal totalSalary,
        BigDecimal totalBonus,
        BigDecimal totalPenalty,
        Long employeeCount) {
}
