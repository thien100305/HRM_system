package com.hrm.hrm_system.repository;

import com.hrm.hrm_system.entity.CompanyMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanyMessageRepository extends JpaRepository<CompanyMessage, Long> {

    List<CompanyMessage> findTop100ByOrderByIdDesc();
}
