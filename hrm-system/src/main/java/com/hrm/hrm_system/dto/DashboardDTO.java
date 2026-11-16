package com.hrm.hrm_system.dto;

public class DashboardDTO {

    private long totalEmployees;
    private long totalDepartments;
    private long totalPositions;
    private long totalLeaveRequests;

    public DashboardDTO() {
    }

    public DashboardDTO(
            long totalEmployees,
            long totalDepartments,
            long totalPositions,
            long totalLeaveRequests) {

        this.totalEmployees = totalEmployees;
        this.totalDepartments = totalDepartments;
        this.totalPositions = totalPositions;
        this.totalLeaveRequests = totalLeaveRequests;
    }

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public long getTotalDepartments() {
        return totalDepartments;
    }

    public void setTotalDepartments(long totalDepartments) {
        this.totalDepartments = totalDepartments;
    }

    public long getTotalPositions() {
        return totalPositions;
    }

    public void setTotalPositions(long totalPositions) {
        this.totalPositions = totalPositions;
    }

    public long getTotalLeaveRequests() {
        return totalLeaveRequests;
    }

    public void setTotalLeaveRequests(long totalLeaveRequests) {
        this.totalLeaveRequests = totalLeaveRequests;
    }

}
