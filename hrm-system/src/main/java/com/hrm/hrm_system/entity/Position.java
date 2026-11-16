package com.hrm.hrm_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "positions")
public class Position {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "position_code")
    private String positionCode;

    @NotBlank(message = "Tên chức vụ không được để trống")
    @Column(columnDefinition = "NVARCHAR(100)", nullable = false)
    private String name;

    @Column(columnDefinition = "NVARCHAR(255)")
    private String description;

    public Position() {
    }

    public Position(
            Long id,
            String positionCode,
            String name,
            String description) {

        this.id = id;
        this.positionCode = positionCode;
        this.name = name;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPositionCode() {
        return positionCode;
    }

    public void setPositionCode(
            String positionCode) {

        this.positionCode = positionCode;
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
        return "Position{" +
                "id=" + id +
                ", positionCode='" + positionCode + '\'' +
                ", name='" + name + '\'' +
                ", description='" + description + '\'' +
                '}';
    }

}
