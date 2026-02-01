package com.attendease.controller;

import com.attendease.dto.AttendanceRequest;
import com.attendease.dto.StudentAttendanceStats;
import com.attendease.model.Attendance;
import com.attendease.model.User;
import com.attendease.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    
    private final AttendanceService attendanceService;
    
    @PostMapping("/mark")
    public ResponseEntity<List<Attendance>> markAttendance(
            @RequestBody AttendanceRequest request,
            @AuthenticationPrincipal User user) {
        List<Attendance> records = attendanceService.markAttendance(request, user);
        return ResponseEntity.ok(records);
    }
    
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<Attendance>> getSessionAttendance(
            @PathVariable Long sessionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceBySessionAndDate(sessionId, date));
    }
    
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Attendance>> getStudentAttendance(
            @PathVariable Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getStudentAttendance(studentId, startDate, endDate));
    }
    
    @GetMapping("/course/{courseId}/stats")
    public ResponseEntity<List<StudentAttendanceStats>> getCourseStats(@PathVariable Long courseId) {
        return ResponseEntity.ok(attendanceService.getCourseAttendanceStats(courseId));
    }
}
