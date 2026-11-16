package com.hrm.hrm_system.repository;

import com.hrm.hrm_system.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.time.LocalDate;

public interface LeaveRequestRepository
                extends JpaRepository<LeaveRequest, Long> {

    List<LeaveRequest> findByEmployeeIdOrderByStartDateDesc(Long employeeId);

    List<LeaveRequest> findByEmployeeIdAndStatusAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long employeeId,
            String status,
            LocalDate periodEnd,
            LocalDate periodStart);

    @Modifying
    @Query("delete from LeaveRequest leaveRequest where leaveRequest.employee.id = :employeeId")
    int deleteAllByEmployeeId(@Param("employeeId") Long employeeId);
}
