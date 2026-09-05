package com.skillgap.service;

import com.skillgap.dto.ApplicationRequest;
import com.skillgap.dto.ApplicationResponse;
import com.skillgap.dto.SkillGapResponse;
import com.skillgap.exception.ConflictException;
import com.skillgap.exception.ForbiddenException;
import com.skillgap.exception.NotFoundException;
import com.skillgap.exception.ValidationException;
import com.skillgap.model.Application;
import com.skillgap.model.Job;
import com.skillgap.model.Student;
import com.skillgap.repository.ApplicationRepository;
import com.skillgap.repository.JobRepository;
import com.skillgap.repository.StudentRepository;
import com.skillgap.security.UserPrincipal;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class ApplicationService {

    private static final List<String> VALID_STATUSES = Arrays.asList(
            "APPLIED", "UNDER_REVIEW", "SHORTLISTED", "REJECTED", "SELECTED"
    );

    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final SkillGapService skillGapService;

    public ApplicationService(ApplicationRepository applicationRepository,
                              StudentRepository studentRepository,
                              JobRepository jobRepository,
                              SkillGapService skillGapService) {
        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
        this.skillGapService = skillGapService;
    }

    public ApplicationResponse apply(ApplicationRequest request, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ForbiddenException("Authentication required to submit job application");
        }

        if (request == null || request.getJobId() == null) {
            throw new ValidationException("Job ID is required to apply");
        }

        int jobId = request.getJobId();

        // Security check: USER role cannot apply on behalf of other students
        int effectiveStudentId;
        if (currentUser.isAdmin()) {
            if (request.getStudentId() == null) {
                throw new ValidationException("Student ID is required when applying as admin");
            }
            effectiveStudentId = request.getStudentId();
        } else {
            // For USER role, strictly enforce the authenticated identity
            effectiveStudentId = currentUser.getUserId();
        }

        // Verify student exists
        Student student = studentRepository.findById(effectiveStudentId);
        if (student == null) {
            throw new NotFoundException("Student not found with ID: " + effectiveStudentId);
        }

        // Verify job exists
        Job job = jobRepository.findById(jobId);
        if (job == null) {
            throw new NotFoundException("Job not found with ID: " + jobId);
        }

        // Duplicate application protection
        Application existing = applicationRepository.findByStudentAndJob(effectiveStudentId, jobId);
        if (existing != null) {
            throw new ConflictException("You have already applied for this job (Application ID: " + existing.getApplicationId() + ")");
        }

        // Authoritative match calculation from backend
        SkillGapResponse gap = skillGapService.analyzeSkillGap(effectiveStudentId, jobId);
        int matchPercent = gap.getOverallMatchPercent();

        // Create application
        Application app = new Application();
        app.setStudentId(effectiveStudentId);
        app.setJobId(jobId);
        app.setMatchPercent(matchPercent);
        app.setStatus("APPLIED");

        Application created = applicationRepository.create(app);
        return toResponse(created);
    }

    public ApplicationResponse updateStatus(int applicationId, String status, UserPrincipal currentUser) {
        if (currentUser == null || !currentUser.isAdmin()) {
            throw new ForbiddenException("Only administrators can update application status");
        }

        if (status == null || status.trim().isEmpty()) {
            throw new ValidationException("Status cannot be empty");
        }

        String normalizedStatus = status.trim().toUpperCase();
        if (!VALID_STATUSES.contains(normalizedStatus)) {
            throw new ValidationException("Invalid status: " + status + ". Allowed values: " + VALID_STATUSES);
        }

        Application app = applicationRepository.findById(applicationId);
        if (app == null) {
            throw new NotFoundException("Application not found with ID: " + applicationId);
        }

        applicationRepository.updateStatus(applicationId, normalizedStatus);
        app.setStatus(normalizedStatus);
        return toResponse(app);
    }

    public List<ApplicationResponse> listApplications(UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ForbiddenException("Authentication required to view applications");
        }

        List<Application> apps;
        if (currentUser.isAdmin()) {
            apps = applicationRepository.findAll();
        } else {
            apps = applicationRepository.findByStudentId(currentUser.getUserId());
        }

        List<ApplicationResponse> responses = new ArrayList<>();
        for (Application a : apps) {
            responses.add(toResponse(a));
        }
        return responses;
    }

    public ApplicationResponse getApplicationById(int applicationId, UserPrincipal currentUser) {
        if (currentUser == null) {
            throw new ForbiddenException("Authentication required");
        }

        Application app = applicationRepository.findById(applicationId);
        if (app == null) {
            throw new NotFoundException("Application not found with ID: " + applicationId);
        }

        // Normal USER can only view their own application
        if (!currentUser.isAdmin() && app.getStudentId() != currentUser.getUserId()) {
            throw new ForbiddenException("Access denied: You cannot view another student's application");
        }

        return toResponse(app);
    }

    private ApplicationResponse toResponse(Application a) {
        ApplicationResponse resp = new ApplicationResponse(
                a.getApplicationId(),
                a.getStudentId(),
                a.getJobId(),
                a.getMatchPercent(),
                a.getStatus()
        );
        resp.setStudentName(a.getStudentName());
        resp.setStudentEmail(a.getStudentEmail());
        resp.setJobTitle(a.getJobTitle());
        resp.setCompany(a.getJobCompany());
        resp.setLocation(a.getJobLocation());
        resp.setCreatedAt(a.getCreatedAt());
        return resp;
    }
}
