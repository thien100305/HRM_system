package com.hrm.hrm_system.service;

import com.hrm.hrm_system.dto.AttendanceImportResult;
import com.hrm.hrm_system.entity.Attendance;
import com.hrm.hrm_system.entity.Employee;
import com.hrm.hrm_system.repository.AttendanceRepository;
import com.hrm.hrm_system.repository.EmployeeRepository;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AttendanceExcelServiceTests {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Test
    void importsValidRowsAndReportsInvalidAndDuplicateRows() throws Exception {
        Employee employee = new Employee();
        employee.setId(7L);
        employee.setEmployeeCode("NV001");

        when(employeeRepository.findAll()).thenReturn(List.of(employee));
        when(attendanceRepository.findByAttendanceDateBetween(any(), any()))
                .thenReturn(List.of());

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "cham-cong.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                workbookBytes());

        AttendanceExcelService service = new AttendanceExcelService(
                attendanceRepository,
                employeeRepository);

        AttendanceImportResult result = service.importFile(file);

        assertThat(result.totalRows()).isEqualTo(4);
        assertThat(result.imported()).isEqualTo(1);
        assertThat(result.skipped()).isEqualTo(3);
        assertThat(result.errors())
                .extracting(error -> error.row())
                .containsExactlyInAnyOrder(3, 4, 5);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Attendance>> captor = ArgumentCaptor.forClass(List.class);
        verify(attendanceRepository).saveAll(captor.capture());
        Attendance saved = captor.getValue().getFirst();
        assertThat(saved.getEmployee().getId()).isEqualTo(7L);
        assertThat(saved.getAttendanceDate()).isEqualTo(LocalDate.of(2026, 7, 20));
        assertThat(saved.getCheckIn().toString()).isEqualTo("08:00");
        assertThat(saved.getCheckOut().toString()).isEqualTo("17:30");
        assertThat(saved.getStatus()).isEqualTo("Đi làm");
    }

    @Test
    void createsAReusableExcelTemplate() throws Exception {
        AttendanceExcelService service = new AttendanceExcelService(
                attendanceRepository,
                employeeRepository);

        try (Workbook workbook = new XSSFWorkbook(
                new java.io.ByteArrayInputStream(service.createTemplate()))) {

            Row header = workbook.getSheetAt(0).getRow(0);
            assertThat(header.getCell(0).getStringCellValue()).isEqualTo("Mã nhân viên");
            assertThat(header.getCell(1).getStringCellValue()).isEqualTo("Ngày chấm công");
            assertThat(header.getCell(2).getStringCellValue()).isEqualTo("Giờ vào");
            assertThat(header.getCell(3).getStringCellValue()).isEqualTo("Giờ ra");
        }
    }

    private byte[] workbookBytes() throws Exception {
        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream output = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Cham cong");
            addRow(sheet, 0, "Mã nhân viên", "Ngày chấm công", "Giờ vào", "Giờ ra");
            addRow(sheet, 1, "NV001", "20/07/2026", "08:00", "17:30");
            addRow(sheet, 2, "NV001", "20/07/2026", "08:10", "17:30");
            addRow(sheet, 3, "KHONGCO", "21/07/2026", "08:00", "17:30");
            addRow(sheet, 4, "NV001", "22/07/2026", "18:00", "08:00");
            workbook.write(output);
            return output.toByteArray();
        }
    }

    private void addRow(
            Sheet sheet,
            int index,
            String employeeCode,
            String date,
            String checkIn,
            String checkOut) {

        Row row = sheet.createRow(index);
        row.createCell(0).setCellValue(employeeCode);
        row.createCell(1).setCellValue(date);
        row.createCell(2).setCellValue(checkIn);
        row.createCell(3).setCellValue(checkOut);
    }
}
