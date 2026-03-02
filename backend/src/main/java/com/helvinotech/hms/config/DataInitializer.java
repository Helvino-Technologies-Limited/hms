package com.helvinotech.hms.config;

import com.helvinotech.hms.entity.User;
import com.helvinotech.hms.enums.UserRole;
import com.helvinotech.hms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        final String adminEmail = "admin@helvino.org";

        // Create or update the admin user
        User admin = userRepository.findByEmail(adminEmail).orElse(new User());
        admin.setFullName("System Administrator");
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode("Hospital@2026"));
        admin.setPhone("0703445756");
        admin.setRole(UserRole.SUPER_ADMIN);
        admin.setDepartment("Administration");
        admin.setActive(true);
        userRepository.save(admin);
        log.info("Admin user ready: {}", adminEmail);
    }
}
