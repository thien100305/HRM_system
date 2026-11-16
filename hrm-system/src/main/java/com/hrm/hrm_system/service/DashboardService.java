package com.hrm.hrm_system.service;

import com.hrm.hrm_system.dto.DashboardDTO;
import com.hrm.hrm_system.dto.MonthlySalaryStat;

import com.hrm.hrm_system.repository.EmployeeRepository;
import com.hrm.hrm_system.repository.DepartmentRepository;
import com.hrm.hrm_system.repository.PositionRepository;
import com.hrm.hrm_system.repository.LeaveRequestRepository;
import com.hrm.hrm_system.repository.SalaryRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    private final EmployeeRepository employeeRepository;

    private final DepartmentRepository departmentRepository;

    private final PositionRepository positionRepository;

    private final LeaveRequestRepository leaveRequestRepository;

    private final SalaryRepository salaryRepository;

    public DashboardService(
            EmployeeRepository employeeRepository,
            DepartmentRepository departmentRepository,
            PositionRepository positionRepository,
            LeaveRequestRepository leaveRequestRepository,
            SalaryRepository salaryRepository) {

        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.positionRepository = positionRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.salaryRepository = salaryRepository;
    }

    public DashboardDTO getDashboardData() {

        return new DashboardDTO(

                employeeRepository.count(),

                departmentRepository.count(),

                positionRepository.count(),

                leaveRequestRepository.count()

        );
    }

    public List<MonthlySalaryStat> getMonthlySalaryStatistics(int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 24));
        List<MonthlySalaryStat> statistics = salaryRepository.getMonthlySalaryStatistics();
        int fromIndex = Math.max(0, statistics.size() - safeLimit);

        return List.copyOf(statistics.subList(fromIndex, statistics.size()));
    }

}
