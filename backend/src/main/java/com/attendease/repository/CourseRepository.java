package com.attendease.repository;

import com.attendease.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByInstitutionId(Long institutionId);
    Optional<Course> findByCourseNameAndInstitutionId(String courseName, Long institutionId);
}
