package com.hrm.hrm_system.service;

import com.hrm.hrm_system.entity.Department;
import com.hrm.hrm_system.repository.DepartmentRepository;
import com.hrm.hrm_system.repository.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class DepartmentService {

    private final DepartmentRepository repository;
    private final EmployeeRepository employeeRepository;

    public DepartmentService(
            DepartmentRepository repository,
            EmployeeRepository employeeRepository) {

        this.repository = repository;
        this.employeeRepository = employeeRepository;
    }

    public List<Department> getAllDepartments() {
        return repository.findAll();
    }

    public Department getDepartmentById(Long id) {
        return repository.findById(id)
                .orElse(null);
    }

    private String generateDepartmentCode(
            String departmentName) {

        String[] words = departmentName.trim()
                .split("\\s+");

        StringBuilder code = new StringBuilder();

        for (String word : words) {

            code.append(
                    Character.toUpperCase(
                            word.charAt(0)));
        }

        return code.toString();
    }

    public Department createDepartment(
            Department department) {

        department.setDepartmentCode(
                generateDepartmentCode(
                        department.getName()));

        return repository.save(
                department);
    }

    public Department updateDepartment(
            Long id,
            Department department) {

        Department existing = repository.findById(id)
                .orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setName(
                department.getName());

        existing.setDescription(
                department.getDescription());

        existing.setDepartmentCode(
                generateDepartmentCode(
                        department.getName()));

        return repository.save(
                existing);
    }

    public void deleteDepartment(Long id) {
        Department department = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy phòng ban"));

        // Giữ lại hồ sơ nhân viên, chỉ gỡ liên kết với phòng ban bị xóa.
        employeeRepository.detachAllFromDepartment(id);
        repository.delete(department);
        repository.flush();
    }

}
