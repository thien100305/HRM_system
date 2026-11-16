package com.hrm.hrm_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "department_code")
    private String departmentCode;

    @NotBlank(message = "Tên phòng ban không được để trống")
    @Column(columnDefinition = "NVARCHAR(100)", nullable = false)
    private String name;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String description;

    public Department() {
    }

    public Department(
            Long id,
            String departmentCode,
            String name,
            String description) {

        this.id = id;
        this.departmentCode = departmentCode;
        this.name = name;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(
            String departmentCode) {

        this.departmentCode = departmentCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description) {

        this.description = description;
    }

    @Override
    public String toString() {
        return "Department{" +
                "id=" + id +
                ", departmentCode='" + departmentCode + '\'' +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }

}
