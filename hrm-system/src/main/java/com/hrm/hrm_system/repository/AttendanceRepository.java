package com.hrm.hrm_system.repository;

import com.hrm.hrm_system.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.time.LocalDate;

public interface AttendanceRepository
        extends JpaRepository<Attendance, Long> {

    List<Attendance> findByEmployeeIdOrderByAttendanceDateDesc(Long employeeId);

    boolean existsByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate attendanceDate);

    List<Attendance> findByEmployeeIdAndAttendanceDateBetween(
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate);

    List<Attendance> findByAttendanceDateBetween(
            LocalDate startDate,
            LocalDate endDate);

    @Modifying
    @Query("delete from Attendance attendance where attendance.employee.id = :employeeId")
    int deleteAllByEmployeeId(@Param("employeeId") Long employeeId);
}
