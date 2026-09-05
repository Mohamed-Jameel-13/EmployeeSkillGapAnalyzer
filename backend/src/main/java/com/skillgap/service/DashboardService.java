package com.skillgap.service;

import com.skillgap.dto.DashboardSummaryDto;
import com.skillgap.dto.TopSkillGapDto;
import com.skillgap.model.Application;
import com.skillgap.repository.ApplicationRepository;
import com.skillgap.repository.JobRepository;
import com.skillgap.repository.RecommendationRepository;
import com.skillgap.repository.StudentRepository;
import com.skillgap.security.UserPrincipal;

import java.util.Collections;
import java.util.List;

public class DashboardService {

    private final StudentRepository studentRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final RecommendationRepository recommendationRepository;

    public DashboardService(StudentRepository studentRepository,
                            JobRepository jobRepository,
                            ApplicationRepository applicationRepository,
                            RecommendationRepository recommendationRepository) {
        this.studentRepository = studentRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.recommendationRepository = recommendationRepository;
    }

    public DashboardSummaryDto getSummary(UserPrincipal currentUser) {
        int totalStudents = studentRepository.countStudents();
        int totalJobs = jobRepository.countJobs();

        if (currentUser != null && !currentUser.isAdmin()) {
            // User-scoped dashboard metrics
            List<Application> userApps = applicationRepository.findByStudentId(currentUser.getUserId());
            int totalUserApps = userApps.size();
            int avgMatch = 0;
            if (totalUserApps > 0) {
                int sum = 0;
                for (Application a : userApps) {
                    sum += a.getMatchPercent();
                }
                avgMatch = (int) Math.round((double) sum / totalUserApps);
            }
            List<TopSkillGapDto> topGaps = recommendationRepository.getTopSkillGaps(5);
            return new DashboardSummaryDto(totalStudents, totalJobs, totalUserApps, avgMatch, topGaps);
        }

        // Platform-wide admin dashboard metrics
        int totalApplications = applicationRepository.countApplications();
        int averageSkillMatch = (int) Math.round(applicationRepository.getAverageMatchPercent());
        List<TopSkillGapDto> topGaps = recommendationRepository.getTopSkillGaps(5);

        return new DashboardSummaryDto(
                totalStudents,
                totalJobs,
                totalApplications,
                averageSkillMatch,
                topGaps
        );
    }
}
