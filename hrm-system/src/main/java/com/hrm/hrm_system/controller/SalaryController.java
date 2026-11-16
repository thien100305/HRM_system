package com.hrm.hrm_system.controller;

import com.hrm.hrm_system.entity.Salary;
import com.hrm.hrm_system.service.SalaryService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salary")
@CrossOrigin("*")
public class SalaryController {

    private final SalaryService service;

    public SalaryController(
            SalaryService service) {

        this.service = service;
    }

    @GetMapping
    public List<Salary> getAllSalary(Authentication authentication) {
        return service.getAllSalary(
                authentication.getName(),
                hasEmployeeRole(authentication));
    }

    @GetMapping("/{id}")
    public Salary getSalaryById(
            @PathVariable Long id,
            Authentication authentication) {

        return service.getSalaryById(
                id,
                authentication.getName(),
                hasEmployeeRole(authentication));
    }

    @PostMapping
    public Salary createSalary(
            @RequestBody Salary salary) {

        return service.createSalary(salary);
    }

    @PostMapping("/generate")
    public List<Salary> generateMonthlySalaries(
            @RequestParam int month,
            @RequestParam int year) {

        return service.generateMonthlySalaries(month, year);
    }

    @PutMapping("/{id}")
    public Salary updateSalary(
            @PathVariable Long id,
            @RequestBody Salary salary) {

        return service.updateSalary(
                id,
                salary);
    }

    @DeleteMapping("/{id}")
    public String deleteSalary(
            @PathVariable Long id) {

        service.deleteSalary(id);

        return "Delete Success";
    }

    private boolean hasEmployeeRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_EMPLOYEE"));
    }

}
