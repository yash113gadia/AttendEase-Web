package com.attendease.repository;

import com.attendease.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByCourseId(Long courseId);
    List<Student> findByInstitutionId(Long institutionId);
    Optional<Student> findByRollNumberAndInstitutionId(String rollNumber, Long institutionId);
    
    @Query("SELECT s FROM Student s WHERE s.course.id = :courseId ORDER BY s.rollNumber")
    List<Student> findByCourseIdOrderByRollNumber(Long courseId);
}
