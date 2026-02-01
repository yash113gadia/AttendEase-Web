package com.attendease.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class AttendanceRequest {
    private Long sessionId;
    private LocalDate date;
    private List<AttendanceEntry> entries;
    
    @Data
    public static class AttendanceEntry {
        private Long studentId;
        private String status; // PRESENT, ABSENT, LATE, EXCUSED
        private String remarks;
    }
}
