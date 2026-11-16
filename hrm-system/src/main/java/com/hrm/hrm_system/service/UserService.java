package com.hrm.hrm_system.service;

import com.hrm.hrm_system.entity.User;
import com.hrm.hrm_system.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository repository;

    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository repository,
            PasswordEncoder passwordEncoder) {

        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {

        return repository.findAll();
    }

    public User getUserById(Long id) {

        return repository.findById(id)
                .orElse(null);
    }

    public User getByUsername(
            String username) {

        return repository.findByUsername(
                username)
                .orElse(null);
    }

    public User createUser(
            User user) {

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()));

        return repository.save(user);
    }

    public User updateUser(
            Long id,
            User user) {

        User existing = repository.findById(id)
                .orElse(null);

        if (existing == null) {
            return null;
        }

        existing.setUsername(
                user.getUsername());

        if (user.getPassword() != null
                && !user.getPassword().isBlank()) {

            existing.setPassword(
                    passwordEncoder.encode(
                            user.getPassword()));
        }

        existing.setRole(
                user.getRole());

        existing.setEmployee(
                user.getEmployee());

        return repository.save(
                existing);
    }

    public void deleteUser(Long id) {

        repository.deleteById(id);
    }

}
