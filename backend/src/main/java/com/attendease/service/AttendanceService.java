package com.attendease.service;

import com.attendease.dto.AttendanceRequest;
import com.attendease.dto.StudentAttendanceStats;
import com.attendease.model.*;
import com.attendease.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    
    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final SessionRepository sessionRepository;
    
    @Transactional
    public List<Attendance> markAttendance(AttendanceRequest request, User markedBy) {
        Session session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));
        
        List<Attendance> savedRecords = new ArrayList<>();
        
        for (AttendanceRequest.AttendanceEntry entry : request.getEntries()) {
            Student student = studentRepository.findById(entry.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found: " + entry.getStudentId()));
            
            // Check if attendance already exists
            Attendance attendance = attendanceRepository
                    .findByStudentIdAndSessionIdAndDate(entry.getStudentId(), request.getSessionId(), request.getDate())
                    .orElse(new Attendance());
            
            attendance.setStudent(student);
            attendance.setSession(session);
            attendance.setDate(request.getDate());
            attendance.setStatus(Attendance.Status.valueOf(entry.getStatus()));
            attendance.setMarkedBy(markedBy);
            attendance.setMarkedAt(LocalDateTime.now());
            attendance.setRemarks(entry.getRemarks());
            
            savedRecords.add(attendanceRepository.save(attendance));
        }
        
        return savedRecords;
    }
    
    public List<Attendance> getAttendanceBySessionAndDate(Long sessionId, LocalDate date) {
        return attendanceRepository.findBySessionIdAndDate(sessionId, date);
    }
    
    public List<Attendance> getStudentAttendance(Long studentId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByStudentIdAndDateBetween(studentId, startDate, endDate);
    }
    
    public List<StudentAttendanceStats> getCourseAttendanceStats(Long courseId) {
        List<Student> students = studentRepository.findByCourseIdOrderByRollNumber(courseId);
        List<StudentAttendanceStats> statsList = new ArrayList<>();
        
        for (Student student : students) {
            Long total = attendanceRepository.countTotalByStudentId(student.getId());
            Long present = attendanceRepository.countPresentByStudentId(student.getId());
            
            double percentage = total > 0 ? (present * 100.0 / total) : 0.0;
            
            statsList.add(new StudentAttendanceStats(
                    student.getId(),
                    student.getRollNumber(),
                    student.getFullName(),
                    total,
                    present,
                    Math.round(percentage * 100.0) / 100.0
            ));
        }
        
        return statsList;
    }
}
