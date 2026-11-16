package com.hrm.hrm_system.service;

import com.hrm.hrm_system.entity.Employee;
import com.hrm.hrm_system.entity.User;
import com.hrm.hrm_system.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthenticatedEmployeeService {

    private final UserRepository userRepository;

    public AuthenticatedEmployeeService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Employee getRequiredEmployee(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Không tìm thấy tài khoản đăng nhập"));

        if (user.getEmployee() == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Tài khoản nhân viên chưa được liên kết với hồ sơ nhân viên");
        }

        return user.getEmployee();
    }
}
