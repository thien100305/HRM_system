package com.hrm.hrm_system.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Ngày chấm công
    private LocalDate attendanceDate;

    // Giờ vào làm
    private LocalTime checkIn;

    // Giờ tan làm
    private LocalTime checkOut;

    @Column(columnDefinition = "NVARCHAR(50)")
    private String status;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    @JsonIgnoreProperties({
            "department",
            "position"
    })
    private Employee employee;

    public Attendance() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(
            LocalDate attendanceDate) {

        this.attendanceDate = attendanceDate;
    }

    public LocalTime getCheckIn() {
        return checkIn;
    }

    public void setCheckIn(
            LocalTime checkIn) {

        this.checkIn = checkIn;
    }

    public LocalTime getCheckOut() {
        return checkOut;
    }

    public void setCheckOut(
            LocalTime checkOut) {

        this.checkOut = checkOut;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(
            String status) {

        this.status = status;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(
            Employee employee) {

        this.employee = employee;
    }

}
