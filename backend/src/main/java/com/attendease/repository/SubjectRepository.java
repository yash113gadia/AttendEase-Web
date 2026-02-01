package com.attendease.repository;

import com.attendease.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByInstitutionId(Long institutionId);
}
