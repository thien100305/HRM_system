package com.hrm.hrm_system.repository;

import com.hrm.hrm_system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByUsernameAndIdNot(String username, Long id);

    boolean existsByEmployeeId(Long employeeId);

    boolean existsByEmployeeIdAndIdNot(Long employeeId, Long id);

    @Modifying
    @Query("delete from User user where user.employee.id = :employeeId")
    int deleteAllByEmployeeId(@Param("employeeId") Long employeeId);
}
