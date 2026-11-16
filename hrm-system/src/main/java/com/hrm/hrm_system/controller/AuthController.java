package com.hrm.hrm_system.controller;

import com.hrm.hrm_system.dto.LoginRequest;
import com.hrm.hrm_system.dto.LoginResponse;
import com.hrm.hrm_system.entity.User;
import com.hrm.hrm_system.repository.UserRepository;
import com.hrm.hrm_system.security.JwtService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private final UserRepository repository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository repository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder) {

        this.repository = repository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        User user = repository.findByUsername(
                request.getUsername()).orElse(null);

        if (user == null) {
            return ResponseEntity.status(401).body("Tên đăng nhập hoặc mật khẩu không đúng");
        }

        boolean legacyPassword = user.getPassword().equals(request.getPassword());
        boolean encodedPassword = user.getPassword().startsWith("$2")
                && passwordEncoder.matches(request.getPassword(), user.getPassword());

        if (!legacyPassword && !encodedPassword) {
            return ResponseEntity.status(401).body("Tên đăng nhập hoặc mật khẩu không đúng");
        }

        String role = user.getRole() == null ? "ROLE_EMPLOYEE" : user.getRole().getName();
        return ResponseEntity.ok(new LoginResponse(
                jwtService.generateToken(user.getUsername()), user.getUsername(), role));
    }

}
