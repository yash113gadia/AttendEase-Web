package com.attendease.repository;

import com.attendease.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByCourseId(Long courseId);
    List<Session> findByTeacherId(Long teacherId);
    List<Session> findByCourseIdAndDayOfWeek(Long courseId, String dayOfWeek);
}
