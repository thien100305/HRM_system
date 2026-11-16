package com.hrm.hrm_system.entity;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.math.BigDecimal;

@Entity
@Table(name = "leave_requests")
public class LeaveRequest {

    @Transient
    public BigDecimal getTotalDays() {

        if (startDate == null || endDate == null) {
            return BigDecimal.ZERO;
        }

        if (isHalfDay()) {
            return new BigDecimal("0.5");
        }

        return BigDecimal.valueOf(ChronoUnit.DAYS.between(startDate, endDate) + 1);
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate startDate;

    private LocalDate endDate;

    @Column(columnDefinition = "NVARCHAR(500)")
    private String reason;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String status;

    @Column(name = "leave_session", length = 20, nullable = false)
    private String leaveSession = "FULL_DAY";

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    public LeaveRequest() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLeaveSession() {
        return leaveSession == null ? "FULL_DAY" : leaveSession;
    }

    public void setLeaveSession(String leaveSession) {
        this.leaveSession = leaveSession;
    }

    @Transient
    public boolean isHalfDay() {
        return "MORNING".equals(getLeaveSession())
                || "AFTERNOON".equals(getLeaveSession());
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }
}
