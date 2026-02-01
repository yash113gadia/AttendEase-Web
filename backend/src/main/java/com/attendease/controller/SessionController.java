package com.attendease.controller;

import com.attendease.model.Session;
import com.attendease.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {
    
    private final SessionRepository sessionRepository;
    
    @GetMapping
    public ResponseEntity<List<Session>> getAllSessions() {
        return ResponseEntity.ok(sessionRepository.findAll());
    }
    
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Session>> getSessionsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(sessionRepository.findByCourseId(courseId));
    }
    
    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Session>> getSessionsByTeacher(@PathVariable Long teacherId) {
        return ResponseEntity.ok(sessionRepository.findByTeacherId(teacherId));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Session> getSession(@PathVariable Long id) {
        return sessionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Session> createSession(@RequestBody Session session) {
        return ResponseEntity.ok(sessionRepository.save(session));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        sessionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
