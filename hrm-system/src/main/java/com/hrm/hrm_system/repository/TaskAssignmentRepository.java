package com.hrm.hrm_system.repository;

import com.hrm.hrm_system.entity.TaskAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, Long> {

    List<TaskAssignment> findByEmployeeIdOrderByDueDateAsc(Long employeeId);

    @Modifying
    @Query("delete from TaskAssignment assignment where assignment.employee.id = :employeeId")
    int deleteAllByEmployeeId(@Param("employeeId") Long employeeId);
}
