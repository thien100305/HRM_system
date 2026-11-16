package com.hrm.hrm_system.repository;

import com.hrm.hrm_system.entity.Position;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PositionRepository
        extends JpaRepository<Position, Long> {
}