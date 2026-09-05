package com.skillgap.service;

import com.skillgap.dto.SkillAnalysisDto;
import com.skillgap.dto.SkillGapResponse;
import com.skillgap.exception.NotFoundException;
import com.skillgap.model.Job;
import com.skillgap.model.JobSkill;
import com.skillgap.model.Student;
import com.skillgap.model.StudentSkill;
import com.skillgap.repository.JobRepository;
import com.skillgap.repository.JobSkillRepository;
import com.skillgap.repository.StudentRepository;
import com.skillgap.repository.StudentSkillRepository;

import java.util.*;

/**
 * Authoritative Skill Gap Engine.
 * Implements deterministic skill-gap calculation and weighted match scoring.
 */
public class SkillGapService {

    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final JobSkillRepository jobSkillRepository;

    public SkillGapService(StudentRepository studentRepository,
                           JobRepository jobRepository,
                           StudentSkillRepository studentSkillRepository,
                           JobSkillRepository jobSkillRepository) {
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
        this.studentSkillRepository = studentSkillRepository;
        this.jobSkillRepository = jobSkillRepository;
    }

    public SkillGapResponse analyzeSkillGap(int studentId, int jobId) {
        // 1. Verify existence of student and job
        Student student = studentRepository.findById(studentId);
        if (student == null) {
            throw new NotFoundException("Student not found with ID: " + studentId);
        }

        Job job = jobRepository.findById(jobId);
        if (job == null) {
            throw new NotFoundException("Job not found with ID: " + jobId);
        }

        // 2. Fetch student's evaluated skills
        List<StudentSkill> studentSkills = studentSkillRepository.findByStudentId(studentId);
        Map<Integer, Integer> studentSkillProficiencyMap = new HashMap<>();
        for (StudentSkill ss : studentSkills) {
            studentSkillProficiencyMap.put(ss.getSkillId(), ss.getProficiency());
        }

        // 3. Fetch job's required skills
        List<JobSkill> jobSkills = jobSkillRepository.findByJobId(jobId);

        // 4. Calculate skill gaps and weighted match percentage
        List<SkillAnalysisDto> analysisList = new ArrayList<>();
        double weightedScoreSum = 0.0;
        double weightedMaxSum = 0.0;

        for (JobSkill js : jobSkills) {
            int skillId = js.getSkillId();
            String skillName = js.getSkillName();
            int requiredLevel = js.getRequiredLevel();
            boolean mandatory = js.isMandatory();

            // Missing skill rule: absence of student skill is treated as currentLevel = 0
            int currentLevel = studentSkillProficiencyMap.getOrDefault(skillId, 0);

            // Calculate gap: max(requiredLevel - currentLevel, 0)
            int gap = Math.max(requiredLevel - currentLevel, 0);

            // Determine status: currentLevel >= requiredLevel ? MATCHED : GAP
            String status = currentLevel >= requiredLevel ? "MATCHED" : "GAP";

            // Calculate skill score capped at 1.0
            double skillScore = Math.min((double) currentLevel / requiredLevel, 1.0);

            // Mandatory skills carry double the weight of optional skills
            double weight = mandatory ? 2.0 : 1.0;

            weightedScoreSum += (skillScore * weight);
            weightedMaxSum += weight;

            analysisList.add(new SkillAnalysisDto(
                    skillId,
                    skillName,
                    currentLevel,
                    requiredLevel,
                    gap,
                    mandatory,
                    status
            ));
        }

        // 5. Calculate overall match percentage
        int overallMatchPercent;
        if (weightedMaxSum == 0.0) {
            overallMatchPercent = 100;
        } else {
            overallMatchPercent = (int) Math.round((weightedScoreSum / weightedMaxSum) * 100.0);
        }

        return new SkillGapResponse(
                studentId,
                jobId,
                overallMatchPercent,
                analysisList
        );
    }
}
