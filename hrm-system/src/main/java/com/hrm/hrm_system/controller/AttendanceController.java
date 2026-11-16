package com.hrm.hrm_system.controller;

import com.hrm.hrm_system.dto.AttendanceImportResult;
import com.hrm.hrm_system.dto.AttendanceMonthlySummary;
import com.hrm.hrm_system.entity.Attendance;
import com.hrm.hrm_system.service.AttendanceExcelService;
import com.hrm.hrm_system.service.AttendanceService;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin("*")
public class AttendanceController {

    private final AttendanceService service;
    private final AttendanceExcelService excelService;

    public AttendanceController(
            AttendanceService service,
            AttendanceExcelService excelService) {

        this.service = service;
        this.excelService = excelService;
    }

    @GetMapping
    public List<Attendance> getAllAttendance(Authentication authentication) {

        return service.getAllAttendance(
                authentication.getName(),
                hasEmployeeRole(authentication));
    }

    @GetMapping("/{id}")
    public Attendance getAttendanceById(
            @PathVariable Long id,
            Authentication authentication) {

        return service.getAttendanceById(
                id,
                authentication.getName(),
                hasEmployeeRole(authentication));
    }

    @GetMapping("/summary")
    public AttendanceMonthlySummary getMonthlySummary(
            @RequestParam int month,
            @RequestParam int year,
            Authentication authentication) {

        return service.getMonthlySummary(authentication.getName(), month, year);
    }

    @PostMapping
    public Attendance createAttendance(
            @RequestBody Attendance attendance,
            Authentication authentication) {

        return service.createAttendance(attendance);
    }

    @PostMapping(
            value = "/import",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AttendanceImportResult importAttendance(
            @RequestParam("file") MultipartFile file) {

        return excelService.importFile(file);
    }

    @GetMapping("/template")
    public ResponseEntity<byte[]> downloadTemplate() {
        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename("mau-cham-cong.xlsx")
                                .build()
                                .toString())
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelService.createTemplate());
    }

    @PutMapping("/{id}")
    public Attendance updateAttendance(
            @PathVariable Long id,
            @RequestBody Attendance attendance) {

        return service.updateAttendance(
                id,
                attendance);
    }

    @DeleteMapping("/{id}")
    public String deleteAttendance(
            @PathVariable Long id) {

        service.deleteAttendance(id);

        return "Delete Success";
    }

    private boolean hasEmployeeRole(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_EMPLOYEE"));
    }

}
