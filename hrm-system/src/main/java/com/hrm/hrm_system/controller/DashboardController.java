package com.hrm.hrm_system.controller;

import com.hrm.hrm_system.dto.DashboardDTO;
import com.hrm.hrm_system.dto.MonthlySalaryStat;
import com.hrm.hrm_system.service.DashboardService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("*")
public class DashboardController {

    private final DashboardService service;

    public DashboardController(
            DashboardService service) {

        this.service = service;
    }

    @GetMapping
    public DashboardDTO getDashboardData() {

        return service.getDashboardData();
    }

    @GetMapping("/salary-statistics")
    public List<MonthlySalaryStat> getMonthlySalaryStatistics(
            @RequestParam(defaultValue = "12") int limit) {

        return service.getMonthlySalaryStatistics(limit);
    }

}
