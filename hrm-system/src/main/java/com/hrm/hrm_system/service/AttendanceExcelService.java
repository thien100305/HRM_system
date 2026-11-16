package com.hrm.hrm_system.service;

import com.hrm.hrm_system.dto.AttendanceImportError;
import com.hrm.hrm_system.dto.AttendanceImportResult;
import com.hrm.hrm_system.entity.Attendance;
import com.hrm.hrm_system.entity.Employee;
import com.hrm.hrm_system.repository.AttendanceRepository;
import com.hrm.hrm_system.repository.EmployeeRepository;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@Transactional
public class AttendanceExcelService {

    private static final List<DateTimeFormatter> DATE_FORMATS = List.of(
            DateTimeFormatter.ISO_LOCAL_DATE,
            DateTimeFormatter.ofPattern("d/M/uuuu"),
            DateTimeFormatter.ofPattern("d-M-uuuu"));

    private static final List<DateTimeFormatter> TIME_FORMATS = List.of(
            DateTimeFormatter.ofPattern("H:mm"),
            DateTimeFormatter.ofPattern("H:mm:ss"));

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;

    public AttendanceExcelService(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository) {

        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
    }

    public AttendanceImportResult importFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw badRequest("Vui lòng chọn file Excel cần nhập");
        }

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            if (workbook.getNumberOfSheets() == 0) {
                throw badRequest("File Excel không có trang tính");
            }

            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(sheet.getFirstRowNum());
            if (headerRow == null) {
                throw badRequest("File Excel không có dòng tiêu đề");
            }

            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();
            Map<String, Integer> columns = readColumns(headerRow, evaluator);
            int employeeCodeColumn = requireColumn(columns, "manhanvien", "employeeCode");
            int dateColumn = requireColumn(columns, "ngaychamcong", "attendanceDate", "date");
            int checkInColumn = requireColumn(columns, "giovao", "checkIn");
            Integer checkOutColumn = findColumn(columns, "giora", "checkOut");

            Map<String, Employee> employeesByCode = new HashMap<>();
            for (Employee employee : employeeRepository.findAll()) {
                if (employee.getEmployeeCode() != null) {
                    employeesByCode.put(
                            normalizeKey(employee.getEmployeeCode()),
                            employee);
                }
            }

            List<ParsedAttendance> parsedRows = new ArrayList<>();
            List<AttendanceImportError> errors = new ArrayList<>();
            int totalRows = 0;

            for (int rowIndex = headerRow.getRowNum() + 1;
                    rowIndex <= sheet.getLastRowNum();
                    rowIndex++) {

                Row row = sheet.getRow(rowIndex);
                if (row == null || isEmptyRow(row, evaluator)) {
                    continue;
                }

                totalRows++;
                int excelRow = rowIndex + 1;
                try {
                    String employeeCode = cellText(
                            row.getCell(employeeCodeColumn),
                            evaluator).trim();
                    if (employeeCode.isBlank()) {
                        throw new IllegalArgumentException("Thiếu mã nhân viên");
                    }

                    Employee employee = employeesByCode.get(normalizeKey(employeeCode));
                    if (employee == null) {
                        throw new IllegalArgumentException(
                                "Không tìm thấy nhân viên có mã " + employeeCode);
                    }

                    LocalDate attendanceDate = readDate(row.getCell(dateColumn), evaluator);
                    if (attendanceDate == null) {
                        throw new IllegalArgumentException("Thiếu ngày chấm công");
                    }
                    if (attendanceDate.isAfter(LocalDate.now())) {
                        throw new IllegalArgumentException(
                                "Ngày chấm công không được ở tương lai");
                    }

                    LocalTime checkIn = readTime(row.getCell(checkInColumn), evaluator);
                    if (checkIn == null) {
                        throw new IllegalArgumentException("Thiếu giờ vào");
                    }

                    LocalTime checkOut = checkOutColumn == null
                            ? null
                            : readTime(row.getCell(checkOutColumn), evaluator);
                    if (checkOut != null && checkOut.isBefore(checkIn)) {
                        throw new IllegalArgumentException(
                                "Giờ ra không được trước giờ vào");
                    }

                    parsedRows.add(new ParsedAttendance(
                            excelRow,
                            employee,
                            attendanceDate,
                            checkIn,
                            checkOut));
                } catch (IllegalArgumentException exception) {
                    errors.add(new AttendanceImportError(excelRow, exception.getMessage()));
                }
            }

            Set<String> existingKeys = loadExistingKeys(parsedRows);
            Set<String> fileKeys = new HashSet<>();
            List<Attendance> recordsToSave = new ArrayList<>();

            for (ParsedAttendance parsed : parsedRows) {
                String key = attendanceKey(parsed.employee().getId(), parsed.date());
                if (existingKeys.contains(key)) {
                    errors.add(new AttendanceImportError(
                            parsed.row(),
                            "Nhân viên đã có chấm công trong ngày này"));
                    continue;
                }
                if (!fileKeys.add(key)) {
                    errors.add(new AttendanceImportError(
                            parsed.row(),
                            "Dòng chấm công bị trùng trong file"));
                    continue;
                }

                Attendance attendance = new Attendance();
                attendance.setEmployee(parsed.employee());
                attendance.setAttendanceDate(parsed.date());
                attendance.setCheckIn(parsed.checkIn());
                attendance.setCheckOut(parsed.checkOut());
                attendance.setStatus(determineStatus(parsed.checkIn(), parsed.checkOut()));
                recordsToSave.add(attendance);
            }

            attendanceRepository.saveAll(recordsToSave);

            return new AttendanceImportResult(
                    totalRows,
                    recordsToSave.size(),
                    errors.size(),
                    errors);
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (IOException exception) {
            throw badRequest("Không thể đọc file Excel. Vui lòng dùng file .xlsx hoặc .xls hợp lệ");
        }
    }

    @Transactional(readOnly = true)
    public byte[] createTemplate() {
        try (Workbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream output = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("Cham cong");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Mã nhân viên");
            header.createCell(1).setCellValue("Ngày chấm công");
            header.createCell(2).setCellValue("Giờ vào");
            header.createCell(3).setCellValue("Giờ ra");
            sheet.createFreezePane(0, 1);
            sheet.setColumnWidth(0, 18 * 256);
            sheet.setColumnWidth(1, 20 * 256);
            sheet.setColumnWidth(2, 14 * 256);
            sheet.setColumnWidth(3, 14 * 256);

            workbook.write(output);
            return output.toByteArray();
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Không thể tạo file Excel mẫu");
        }
    }

    private Map<String, Integer> readColumns(Row row, FormulaEvaluator evaluator) {
        Map<String, Integer> columns = new HashMap<>();
        for (Cell cell : row) {
            String key = normalizeKey(cellText(cell, evaluator));
            if (!key.isBlank()) {
                columns.put(key, cell.getColumnIndex());
            }
        }
        return columns;
    }

    private int requireColumn(
            Map<String, Integer> columns,
            String... aliases) {

        Integer column = findColumn(columns, aliases);
        if (column == null) {
            throw badRequest(
                    "File Excel thiếu cột bắt buộc: "
                            + displayColumnName(aliases[0]));
        }
        return column;
    }

    private Integer findColumn(
            Map<String, Integer> columns,
            String... aliases) {

        for (String alias : aliases) {
            Integer column = columns.get(normalizeKey(alias));
            if (column != null) {
                return column;
            }
        }
        return null;
    }

    private String displayColumnName(String normalizedName) {
        return switch (normalizedName) {
            case "manhanvien" -> "Mã nhân viên";
            case "ngaychamcong" -> "Ngày chấm công";
            case "giovao" -> "Giờ vào";
            default -> normalizedName;
        };
    }

    private boolean isEmptyRow(Row row, FormulaEvaluator evaluator) {
        for (Cell cell : row) {
            if (!cellText(cell, evaluator).isBlank()) {
                return false;
            }
        }
        return true;
    }

    private String cellText(Cell cell, FormulaEvaluator evaluator) {
        if (cell == null) {
            return "";
        }
        return new org.apache.poi.ss.usermodel.DataFormatter(Locale.forLanguageTag("vi-VN"))
                .formatCellValue(cell, evaluator);
    }

    private LocalDate readDate(Cell cell, FormulaEvaluator evaluator) {
        if (cell == null || cell.getCellType() == CellType.BLANK) {
            return null;
        }
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getLocalDateTimeCellValue().toLocalDate();
        }

        String value = cellText(cell, evaluator).trim();
        if (value.isBlank()) {
            return null;
        }
        for (DateTimeFormatter formatter : DATE_FORMATS) {
            try {
                return LocalDate.parse(value, formatter);
            } catch (DateTimeParseException ignored) {
                // Thử định dạng tiếp theo.
            }
        }
        throw new IllegalArgumentException(
                "Ngày không hợp lệ; dùng dd/MM/yyyy hoặc yyyy-MM-dd");
    }

    private LocalTime readTime(Cell cell, FormulaEvaluator evaluator) {
        if (cell == null || cell.getCellType() == CellType.BLANK) {
            return null;
        }
        if (cell.getCellType() == CellType.NUMERIC) {
            LocalDateTime dateTime = DateUtil.getLocalDateTime(cell.getNumericCellValue());
            return dateTime.toLocalTime().withNano(0);
        }

        String value = cellText(cell, evaluator).trim();
        if (value.isBlank()) {
            return null;
        }
        for (DateTimeFormatter formatter : TIME_FORMATS) {
            try {
                return LocalTime.parse(value, formatter);
            } catch (DateTimeParseException ignored) {
                // Thử định dạng tiếp theo.
            }
        }
        throw new IllegalArgumentException(
                "Giờ không hợp lệ; dùng HH:mm hoặc HH:mm:ss");
    }

    private Set<String> loadExistingKeys(List<ParsedAttendance> parsedRows) {
        if (parsedRows.isEmpty()) {
            return new HashSet<>();
        }

        LocalDate firstDate = parsedRows.stream()
                .map(ParsedAttendance::date)
                .min(LocalDate::compareTo)
                .orElseThrow();
        LocalDate lastDate = parsedRows.stream()
                .map(ParsedAttendance::date)
                .max(LocalDate::compareTo)
                .orElseThrow();

        Set<String> keys = new HashSet<>();
        for (Attendance attendance
                : attendanceRepository.findByAttendanceDateBetween(firstDate, lastDate)) {
            if (attendance.getEmployee() != null) {
                keys.add(attendanceKey(
                        attendance.getEmployee().getId(),
                        attendance.getAttendanceDate()));
            }
        }
        return keys;
    }

    private String attendanceKey(Long employeeId, LocalDate date) {
        return employeeId + "|" + date;
    }

    private String normalizeKey(String value) {
        String normalized = Normalizer.normalize(
                value == null ? "" : value.trim(),
                Normalizer.Form.NFD);
        return normalized
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd')
                .replace('Đ', 'D')
                .replaceAll("[^A-Za-z0-9]", "")
                .toLowerCase(Locale.ROOT);
    }

    private String determineStatus(LocalTime checkIn, LocalTime checkOut) {
        if (checkIn.isAfter(LocalTime.of(8, 0))) {
            return "Đi muộn";
        }
        if (checkOut != null && checkOut.isBefore(LocalTime.of(17, 0))) {
            return "Về sớm";
        }
        return "Đi làm";
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private record ParsedAttendance(
            int row,
            Employee employee,
            LocalDate date,
            LocalTime checkIn,
            LocalTime checkOut) {
    }
}
