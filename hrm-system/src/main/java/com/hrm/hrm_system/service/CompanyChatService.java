package com.hrm.hrm_system.service;

import com.hrm.hrm_system.entity.CompanyMessage;
import com.hrm.hrm_system.entity.User;
import com.hrm.hrm_system.repository.CompanyMessageRepository;
import com.hrm.hrm_system.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Transactional
public class CompanyChatService {

    private final CompanyMessageRepository messageRepository;
    private final UserRepository userRepository;

    public CompanyChatService(
            CompanyMessageRepository messageRepository,
            UserRepository userRepository) {

        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CompanyMessage> getRecentMessages() {
        List<CompanyMessage> messages = new ArrayList<>(
                messageRepository.findTop100ByOrderByIdDesc());
        Collections.reverse(messages);
        return messages;
    }

    public CompanyMessage send(String username, String requestedContent) {
        String content = requestedContent == null ? "" : requestedContent.trim();
        if (content.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nội dung tin nhắn không được để trống");
        }
        if (content.length() > 1000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tin nhắn không được vượt quá 1000 ký tự");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Không tìm thấy tài khoản đăng nhập"));

        String displayName = user.getEmployee() != null
                && user.getEmployee().getFullName() != null
                && !user.getEmployee().getFullName().isBlank()
                ? user.getEmployee().getFullName()
                : user.getUsername();

        CompanyMessage message = new CompanyMessage();
        message.setSenderUsername(user.getUsername());
        message.setSenderName(displayName);
        message.setContent(content);
        message.setSentAt(LocalDateTime.now());
        return messageRepository.save(message);
    }

    public void delete(Long id) {
        CompanyMessage message = messageRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy tin nhắn"));
        messageRepository.delete(message);
    }
}
