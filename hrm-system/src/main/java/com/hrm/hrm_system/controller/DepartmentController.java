package com.hrm.hrm_system.controller;

import com.hrm.hrm_system.entity.Department;
import com.hrm.hrm_system.service.DepartmentService;

import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@CrossOrigin("*")
public class DepartmentController {

    private final DepartmentService service;

    public DepartmentController(DepartmentService service) {
        this.service = service;
    }

    @GetMapping
    public List<Department> getAllDepartments() {
        return service.getAllDepartments();
    }

    @GetMapping("/{id}")
    public Department getDepartmentById(@PathVariable Long id) {
        return service.getDepartmentById(id);
    }

    @PostMapping
    public Department createDepartment(@Valid @RequestBody Department department) {
        return service.createDepartment(department);
    }

    @PutMapping("/{id}")
    public Department updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody Department department) {

        return service.updateDepartment(id, department);
    }

    @DeleteMapping("/{id}")
    public String deleteDepartment(@PathVariable Long id) {

        service.deleteDepartment(id);

        return "Delete Success";
    }
}
