package com.hrm.hrm_system.repository;

import com.hrm.hrm_system.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository
        extends JpaRepository<Department, Long> {
}