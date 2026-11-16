package com.hrm.hrm_system.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(
            ResponseStatusException exception) {

        String message = exception.getReason() == null
                ? "Yêu cầu không hợp lệ"
                : exception.getReason();

        return ResponseEntity
                .status(exception.getStatusCode())
                .body(Map.of("message", message));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolation(
            DataIntegrityViolationException exception) {

        String details = exception.getMostSpecificCause().getMessage();
        String message;

        if (details != null && details.contains("UX_employees_email")) {
            message = "Email đã được sử dụng bởi nhân viên khác";
        } else if (details != null && details.contains("UX_employees_phone")) {
            message = "Số điện thoại đã được sử dụng bởi nhân viên khác";
        } else {
            message = "Dữ liệu bị trùng hoặc đang được sử dụng";
        }

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("message", message));
    }
}
