package com.attendease.config;

import com.attendease.model.*;
import com.attendease.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final InstitutionRepository institutionRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Only initialize if no users exist
        if (userRepository.count() > 0) {
            return;
        }

        // Create default institution
        Institution institution = new Institution();
        institution.setName("Demo University");
        institution.setAddress("123 Education Street");
        institution = institutionRepository.save(institution);

        // Create admin user
        User admin = new User();
        admin.setUsername("admin");
        admin.setPasswordHash(passwordEncoder.encode("admin123"));
        admin.setFullName("System Admin");
        admin.setEmail("admin@attendease.com");
        admin.setRole(User.Role.ADMIN);
        admin.setInstitution(institution);
        userRepository.save(admin);

        // Create teacher user
        User teacher = new User();
        teacher.setUsername("teacher");
        teacher.setPasswordHash(passwordEncoder.encode("teacher123"));
        teacher.setFullName("John Teacher");
        teacher.setEmail("teacher@attendease.com");
        teacher.setRole(User.Role.TEACHER);
        teacher.setInstitution(institution);
        userRepository.save(teacher);

        // Create sample courses
        Course cs = new Course();
        cs.setCourseName("B.Tech Computer Science 2025");
        cs.setDescription("Computer Science and Engineering");
        cs.setInstitution(institution);
        cs = courseRepository.save(cs);

        Course it = new Course();
        it.setCourseName("B.Tech Information Technology 2025");
        it.setDescription("Information Technology");
        it.setInstitution(institution);
        it = courseRepository.save(it);

        // Create sample students
        String[] firstNames = {"Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Rohit", "Kavita", "Arjun", "Neha"};
        String[] lastNames = {"Sharma", "Patel", "Singh", "Kumar", "Gupta", "Verma", "Joshi", "Mehta", "Rao", "Reddy"};

        for (int i = 0; i < 10; i++) {
            Student student = new Student();
            student.setRollNumber(String.format("CS2025%03d", i + 1));
            student.setFirstName(firstNames[i]);
            student.setLastName(lastNames[i]);
            student.setEmail(firstNames[i].toLowerCase() + "@student.edu");
            student.setCourse(cs);
            student.setInstitution(institution);
            studentRepository.save(student);
        }

        for (int i = 0; i < 5; i++) {
            Student student = new Student();
            student.setRollNumber(String.format("IT2025%03d", i + 1));
            student.setFirstName(firstNames[i]);
            student.setLastName(lastNames[9 - i]);
            student.setEmail(firstNames[i].toLowerCase() + ".it@student.edu");
            student.setCourse(it);
            student.setInstitution(institution);
            studentRepository.save(student);
        }

        System.out.println("✅ Demo data initialized successfully!");
        System.out.println("   Admin: admin / admin123");
        System.out.println("   Teacher: teacher / teacher123");
    }
}
