package com.attendease.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StudentAttendanceStats {
    private Long studentId;
    private String rollNumber;
    private String fullName;
    private Long totalClasses;
    private Long presentCount;
    private Double attendancePercentage;
}
