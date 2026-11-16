package com.hrm.hrm_system.service;

import com.hrm.hrm_system.dto.AccountRequest;
import com.hrm.hrm_system.dto.AccountResponse;
import com.hrm.hrm_system.entity.Employee;
import com.hrm.hrm_system.entity.Role;
import com.hrm.hrm_system.entity.User;
import com.hrm.hrm_system.repository.EmployeeRepository;
import com.hrm.hrm_system.repository.RoleRepository;
import com.hrm.hrm_system.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
@Transactional
public class AccountService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<AccountResponse> getAll() {
        return userRepository.findAll(Sort.by(Sort.Direction.ASC, "username"))
                .stream()
                .map(AccountResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public AccountResponse getById(Long id) {
        return AccountResponse.from(requireUser(id));
    }

    public AccountResponse create(AccountRequest request) {
        String username = normalizeUsername(request.getUsername());
        String password = requirePassword(request.getPassword(), true);

        if (userRepository.existsByUsername(username)) {
            throw conflict("Tên đăng nhập đã được sử dụng");
        }

        Role role = requireRole(request.getRole());
        Employee employee = resolveEmployee(request.getEmployeeId(), null);
        requireEmployeeForEmployeeRole(role, employee);

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setEmployee(employee);
        return AccountResponse.from(userRepository.save(user));
    }

    public AccountResponse update(
            Long id,
            AccountRequest request,
            String currentUsername) {
        User user = requireUser(id);
        String username = normalizeUsername(request.getUsername());

        if (userRepository.existsByUsernameAndIdNot(username, id)) {
            throw conflict("Tên đăng nhập đã được sử dụng");
        }

        Role role = requireRole(request.getRole());
        Employee employee = resolveEmployee(request.getEmployeeId(), id);
        requireEmployeeForEmployeeRole(role, employee);

        if (user.getUsername().equalsIgnoreCase(currentUsername)
                && (!user.getUsername().equals(username)
                || !"ROLE_ADMIN".equals(role.getName()))) {
            throw conflict("Không thể đổi tên đăng nhập hoặc vai trò của tài khoản đang sử dụng");
        }

        user.setUsername(username);
        user.setRole(role);
        user.setEmployee(employee);

        String password = requirePassword(request.getPassword(), false);
        if (password != null) {
            user.setPassword(passwordEncoder.encode(password));
        }

        return AccountResponse.from(userRepository.save(user));
    }

    public void delete(Long id, String currentUsername) {
        User user = requireUser(id);
        if (user.getUsername().equalsIgnoreCase(currentUsername)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Bạn không thể xóa tài khoản đang đăng nhập");
        }
        userRepository.delete(user);
    }

    private User requireUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy tài khoản"));
    }

    private Role requireRole(String requestedRole) {
        String roleName = requestedRole == null
                ? ""
                : requestedRole.trim().toUpperCase(Locale.ROOT).replace("ROLE_", "");

        if (!List.of("ADMIN", "HR", "EMPLOYEE").contains(roleName)) {
            throw badRequest("Vai trò tài khoản không hợp lệ");
        }

        return roleRepository.findByName("ROLE_" + roleName)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Hệ thống chưa cấu hình vai trò " + roleName));
    }

    private Employee resolveEmployee(Long employeeId, Long currentUserId) {
        if (employeeId == null) {
            return null;
        }

        boolean alreadyLinked = currentUserId == null
                ? userRepository.existsByEmployeeId(employeeId)
                : userRepository.existsByEmployeeIdAndIdNot(employeeId, currentUserId);

        if (alreadyLinked) {
            throw conflict("Nhân viên này đã được liên kết với tài khoản khác");
        }

        return employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy nhân viên"));
    }

    private void requireEmployeeForEmployeeRole(Role role, Employee employee) {
        if ("ROLE_EMPLOYEE".equals(role.getName()) && employee == null) {
            throw badRequest("Tài khoản nhân viên phải được liên kết với hồ sơ nhân viên");
        }
    }

    private String normalizeUsername(String username) {
        if (username == null || username.isBlank()) {
            throw badRequest("Tên đăng nhập là bắt buộc");
        }

        String normalized = username.trim().toLowerCase(Locale.ROOT);
        if (normalized.length() < 4 || normalized.length() > 50
                || !normalized.matches("[a-z0-9._-]+")) {
            throw badRequest("Tên đăng nhập phải có 4-50 ký tự và chỉ gồm chữ, số, ., _ hoặc -");
        }
        return normalized;
    }

    private String requirePassword(String password, boolean required) {
        if (password == null || password.isBlank()) {
            if (required) {
                throw badRequest("Mật khẩu là bắt buộc");
            }
            return null;
        }
        if (password.length() < 6) {
            throw badRequest("Mật khẩu phải có ít nhất 6 ký tự");
        }
        return password;
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }
}
