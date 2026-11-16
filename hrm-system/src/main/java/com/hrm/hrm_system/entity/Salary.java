package com.hrm.hrm_system.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "salary")
public class Salary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer month;

    private Integer year;

    private BigDecimal basicSalary;

    private BigDecimal allowance;

    private Integer workingDays;

    private BigDecimal totalSalary;

    @Column(name = "leave_day_units", precision = 5, scale = 1, nullable = false)
    private BigDecimal leaveDays;

    @Column(name = "late_days", nullable = false)
    private Integer lateDays;

    @Column(name = "attendance_bonus", precision = 18, scale = 2, nullable = false)
    private BigDecimal attendanceBonus;

    @Column(name = "late_penalty", precision = 18, scale = 2, nullable = false)
    private BigDecimal latePenalty;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    public Salary() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getMonth() {
        return month;
    }

    public void setMonth(Integer month) {
        this.month = month;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public BigDecimal getBasicSalary() {
        return basicSalary;
    }

    public void setBasicSalary(BigDecimal basicSalary) {
        this.basicSalary = basicSalary;
    }

    public BigDecimal getAllowance() {
        return allowance;
    }

    public void setAllowance(BigDecimal allowance) {
        this.allowance = allowance;
    }

    public Integer getWorkingDays() {
        return workingDays;
    }

    public void setWorkingDays(Integer workingDays) {
        this.workingDays = workingDays;
    }

    public BigDecimal getTotalSalary() {
        return totalSalary;
    }

    public void setTotalSalary(BigDecimal totalSalary) {
        this.totalSalary = totalSalary;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public BigDecimal getLeaveDays() {
        return leaveDays;
    }

    public void setLeaveDays(BigDecimal leaveDays) {
        this.leaveDays = leaveDays;
    }

    public Integer getLateDays() {
        return lateDays;
    }

    public void setLateDays(Integer lateDays) {
        this.lateDays = lateDays;
    }

    public BigDecimal getAttendanceBonus() {
        return attendanceBonus;
    }

    public void setAttendanceBonus(BigDecimal attendanceBonus) {
        this.attendanceBonus = attendanceBonus;
    }

    public BigDecimal getLatePenalty() {
        return latePenalty;
    }

    public void setLatePenalty(BigDecimal latePenalty) {
        this.latePenalty = latePenalty;
    }

    // Generate Getter Setter
}
