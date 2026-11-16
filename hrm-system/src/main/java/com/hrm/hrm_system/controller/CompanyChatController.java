package com.hrm.hrm_system.controller;

import com.hrm.hrm_system.dto.CompanyMessageRequest;
import com.hrm.hrm_system.entity.CompanyMessage;
import com.hrm.hrm_system.service.CompanyChatService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/company-chat")
@CrossOrigin("*")
public class CompanyChatController {

    private final CompanyChatService service;

    public CompanyChatController(CompanyChatService service) {
        this.service = service;
    }

    @GetMapping
    public List<CompanyMessage> getMessages() {
        return service.getRecentMessages();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CompanyMessage send(
            @RequestBody CompanyMessageRequest request,
            Authentication authentication) {
        return service.send(authentication.getName(), request.getContent());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
