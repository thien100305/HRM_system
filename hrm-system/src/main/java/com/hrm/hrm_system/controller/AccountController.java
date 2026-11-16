package com.hrm.hrm_system.controller;

import com.hrm.hrm_system.dto.AccountRequest;
import com.hrm.hrm_system.dto.AccountResponse;
import com.hrm.hrm_system.service.AccountService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin("*")
public class AccountController {

    private final AccountService service;

    public AccountController(AccountService service) {
        this.service = service;
    }

    @GetMapping
    public List<AccountResponse> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public AccountResponse getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AccountResponse create(@RequestBody AccountRequest request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public AccountResponse update(
            @PathVariable Long id,
            @RequestBody AccountRequest request,
            Authentication authentication) {
        return service.update(id, request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id,
            Authentication authentication) {
        service.delete(id, authentication.getName());
    }
}
