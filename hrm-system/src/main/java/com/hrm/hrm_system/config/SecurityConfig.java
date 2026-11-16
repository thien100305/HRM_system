package com.hrm.hrm_system.config;

import com.hrm.hrm_system.security.JwtFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

        private final JwtFilter jwtFilter;

        public SecurityConfig(
                        JwtFilter jwtFilter) {

                this.jwtFilter = jwtFilter;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http)
                        throws Exception {

                return http

                                .csrf(csrf -> csrf.disable())

                                .cors(cors -> {
                                })

                                .authorizeHttpRequests(auth -> auth

                                                .requestMatchers(HttpMethod.POST, "/api/auth/login")
                                                .permitAll()

                                                .requestMatchers("/api/dashboard/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "HR")

                                                .requestMatchers(HttpMethod.GET, "/api/leave-requests/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "HR",
                                                                "EMPLOYEE")

                                                .requestMatchers(HttpMethod.POST, "/api/leave-requests")
                                                .hasRole("EMPLOYEE")

                                                .requestMatchers(HttpMethod.PUT,
                                                                "/api/leave-requests/*/approve",
                                                                "/api/leave-requests/*/reject")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "HR")

                                                .requestMatchers(HttpMethod.PUT, "/api/leave-requests/*")
                                                .hasRole("EMPLOYEE")

                                                .requestMatchers(HttpMethod.DELETE, "/api/leave-requests/*")
                                                .hasRole("ADMIN")

                                                .requestMatchers("/api/employees/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "HR")

                                                .requestMatchers("/api/accounts/**")
                                                .hasRole("ADMIN")

                                                .requestMatchers(HttpMethod.GET, "/api/company-chat/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "HR",
                                                                "EMPLOYEE")

                                                .requestMatchers(HttpMethod.POST, "/api/company-chat")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "HR",
                                                                "EMPLOYEE")

                                                .requestMatchers(HttpMethod.DELETE, "/api/company-chat/*")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "HR")

                                                .requestMatchers(HttpMethod.GET, "/api/task-assignments/**")
                                                .hasAnyRole(
                                                                "HR",
                                                                "EMPLOYEE")

                                                .requestMatchers(HttpMethod.PATCH, "/api/task-assignments/*/status")
                                                .hasAnyRole(
                                                                "HR",
                                                                "EMPLOYEE")

                                                .requestMatchers("/api/task-assignments/**")
                                                .hasRole("HR")

                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/departments/**",
                                                                "/api/positions/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "HR")

                                                .requestMatchers("/api/departments/**", "/api/positions/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "HR")

                                                .requestMatchers(HttpMethod.GET,
                                                                "/api/attendance/**",
                                                                "/api/salary/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "HR",
                                                                "EMPLOYEE")

                                                .requestMatchers(HttpMethod.POST, "/api/attendance")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "HR")

                                                .requestMatchers("/api/attendance/**", "/api/salary/**")
                                                .hasAnyRole(
                                                                "ADMIN",
                                                                "HR")

                                                .anyRequest()
                                                .hasRole("ADMIN"))

                                .addFilterBefore(
                                                jwtFilter,
                                                UsernamePasswordAuthenticationFilter.class)

                                .build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {

                return new BCryptPasswordEncoder();
        }

}
