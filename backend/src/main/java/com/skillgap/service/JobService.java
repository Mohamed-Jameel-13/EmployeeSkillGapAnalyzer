package com.skillgap.service;

import com.skillgap.dto.CreateJobRequest;
import com.skillgap.dto.JobDto;
import com.skillgap.dto.JobSkillDto;
import com.skillgap.dto.JobSkillRequest;
import com.skillgap.exception.ForbiddenException;
import com.skillgap.exception.NotFoundException;
import com.skillgap.exception.ValidationException;
import com.skillgap.model.Job;
import com.skillgap.model.JobSkill;
import com.skillgap.model.Skill;
import com.skillgap.repository.JobRepository;
import com.skillgap.repository.JobSkillRepository;
import com.skillgap.repository.SkillRepository;
import com.skillgap.security.UserPrincipal;

import java.util.ArrayList;
import java.util.List;

public class JobService {

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final SkillRepository skillRepository;

    public JobService(JobRepository jobRepository,
                      JobSkillRepository jobSkillRepository,
                      SkillRepository skillRepository) {
        this.jobRepository = jobRepository;
        this.jobSkillRepository = jobSkillRepository;
        this.skillRepository = skillRepository;
    }

    public List<JobDto> getAllJobs() {
        List<Job> jobs = jobRepository.findAll();
        List<JobDto> dtos = new ArrayList<>();
        for (Job j : jobs) {
            dtos.add(new JobDto(j.getJobId(), j.getTitle(), j.getCompany(), j.getLocation(), j.getCreatedAt()));
        }
        return dtos;
    }

    public JobDto getJobById(int jobId) {
        Job j = jobRepository.findById(jobId);
        if (j == null) {
            throw new NotFoundException("Job not found with ID: " + jobId);
        }
        return new JobDto(j.getJobId(), j.getTitle(), j.getCompany(), j.getLocation(), j.getCreatedAt());
    }

    public JobDto createJob(CreateJobRequest request, UserPrincipal currentUser) {
        requireAdmin(currentUser);
        if (request == null) {
            throw new ValidationException("Request body cannot be empty");
        }
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new ValidationException("Job title is required");
        }
        if (request.getCompany() == null || request.getCompany().trim().isEmpty()) {
            throw new ValidationException("Job company is required");
        }
        if (request.getLocation() == null || request.getLocation().trim().isEmpty()) {
            throw new ValidationException("Job location is required");
        }

        Job job = new Job();
        job.setTitle(request.getTitle().trim());
        job.setCompany(request.getCompany().trim());
        job.setLocation(request.getLocation().trim());

        Job created = jobRepository.create(job);
        return new JobDto(created.getJobId(), created.getTitle(), created.getCompany(), created.getLocation(), created.getCreatedAt());
    }

    public JobDto updateJob(int jobId, CreateJobRequest request, UserPrincipal currentUser) {
        requireAdmin(currentUser);
        Job existing = jobRepository.findById(jobId);
        if (existing == null) {
            throw new NotFoundException("Job not found with ID: " + jobId);
        }

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            existing.setTitle(request.getTitle().trim());
        }
        if (request.getCompany() != null && !request.getCompany().trim().isEmpty()) {
            existing.setCompany(request.getCompany().trim());
        }
        if (request.getLocation() != null && !request.getLocation().trim().isEmpty()) {
            existing.setLocation(request.getLocation().trim());
        }

        Job updated = jobRepository.update(existing);
        return new JobDto(updated.getJobId(), updated.getTitle(), updated.getCompany(), updated.getLocation(), updated.getCreatedAt());
    }

    public boolean deleteJob(int jobId, UserPrincipal currentUser) {
        requireAdmin(currentUser);
        Job existing = jobRepository.findById(jobId);
        if (existing == null) {
            throw new NotFoundException("Job not found with ID: " + jobId);
        }
        return jobRepository.delete(jobId);
    }

    // Job Skills
    public List<JobSkillDto> getJobSkills(int jobId) {
        Job job = jobRepository.findById(jobId);
        if (job == null) {
            throw new NotFoundException("Job not found with ID: " + jobId);
        }

        List<JobSkill> list = jobSkillRepository.findByJobId(jobId);
        List<JobSkillDto> dtos = new ArrayList<>();
        int idCounter = 1;
        for (JobSkill js : list) {
            dtos.add(new JobSkillDto(
                    idCounter++,
                    js.getSkillId(),
                    js.getSkillName(),
                    js.getRequiredLevel(),
                    js.isMandatory()
            ));
        }
        return dtos;
    }

    public JobSkillDto addOrUpdateJobSkill(int jobId, JobSkillRequest request, UserPrincipal currentUser) {
        requireAdmin(currentUser);
        Job job = jobRepository.findById(jobId);
        if (job == null) {
            throw new NotFoundException("Job not found with ID: " + jobId);
        }

        if (request == null) {
            throw new ValidationException("Request body cannot be empty");
        }
        if (request.getRequiredLevel() == null || request.getRequiredLevel() < 1 || request.getRequiredLevel() > 5) {
            throw new ValidationException("Required level must be between 1 and 5");
        }

        Skill skill = null;
        if (request.getSkillId() != null) {
            skill = skillRepository.findById(request.getSkillId());
        }
        if (skill == null && request.getSkillName() != null && !request.getSkillName().trim().isEmpty()) {
            skill = skillRepository.findByName(request.getSkillName().trim());
            if (skill == null) {
                skill = skillRepository.create(new Skill(0, request.getSkillName().trim(), "General"));
            }
        }

        if (skill == null) {
            throw new ValidationException("Skill ID or valid Skill Name is required");
        }

        boolean mandatory = request.getMandatory() != null ? request.getMandatory() : true;
        JobSkill js = jobSkillRepository.upsert(jobId, skill.getSkillId(), request.getRequiredLevel(), mandatory);

        return new JobSkillDto(
                1,
                js.getSkillId(),
                js.getSkillName(),
                js.getRequiredLevel(),
                js.isMandatory()
        );
    }

    public boolean deleteJobSkill(int jobId, int skillId, UserPrincipal currentUser) {
        requireAdmin(currentUser);
        Job job = jobRepository.findById(jobId);
        if (job == null) {
            throw new NotFoundException("Job not found with ID: " + jobId);
        }
        return jobSkillRepository.delete(jobId, skillId);
    }

    private void requireAdmin(UserPrincipal currentUser) {
        if (currentUser == null || !currentUser.isAdmin()) {
            throw new ForbiddenException("Access denied: Administrative privilege required");
        }
    }
}
