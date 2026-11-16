package com.hrm.hrm_system.repository;

import com.hrm.hrm_system.entity.Salary;
import com.hrm.hrm_system.dto.MonthlySalaryStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SalaryRepository
        extends JpaRepository<Salary, Long> {

    List<Salary> findByEmployeeIdOrderByYearDescMonthDesc(Long employeeId);

    Optional<Salary> findByEmployeeIdAndMonthAndYear(
            Long employeeId,
            Integer month,
            Integer year);

    @Query("""
            select new com.hrm.hrm_system.dto.MonthlySalaryStat(
                s.year,
                s.month,
                sum(s.totalSalary),
                sum(s.attendanceBonus),
                sum(s.latePenalty),
                count(s.id)
            )
            from Salary s
            group by s.year, s.month
            order by s.year, s.month
            """)
    List<MonthlySalaryStat> getMonthlySalaryStatistics();

    @Modifying
    @Query("delete from Salary salary where salary.employee.id = :employeeId")
    int deleteAllByEmployeeId(@Param("employeeId") Long employeeId);
}
