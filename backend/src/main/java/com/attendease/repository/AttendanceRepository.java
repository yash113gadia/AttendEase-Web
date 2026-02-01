package com.attendease.repository;

import com.attendease.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentIdAndDateBetween(Long studentId, LocalDate startDate, LocalDate endDate);
    List<Attendance> findBySessionIdAndDate(Long sessionId, LocalDate date);
    Optional<Attendance> findByStudentIdAndSessionIdAndDate(Long studentId, Long sessionId, LocalDate date);
    
    @Query("SELECT a FROM Attendance a WHERE a.student.course.id = :courseId AND a.date = :date")
    List<Attendance> findByCourseIdAndDate(Long courseId, LocalDate date);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.status = 'PRESENT'")
    Long countPresentByStudentId(Long studentId);
    
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId")
    Long countTotalByStudentId(Long studentId);
}
