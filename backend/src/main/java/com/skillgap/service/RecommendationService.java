package com.skillgap.service;

import com.skillgap.dto.RecommendationDto;
import com.skillgap.dto.SkillAnalysisDto;
import com.skillgap.dto.SkillGapResponse;
import com.skillgap.model.Recommendation;
import com.skillgap.repository.RecommendationRepository;

import java.util.ArrayList;
import java.util.List;

/**
 * Authoritative Recommendation Engine.
 * Generates deterministic, prioritized recommendations for skill gaps and handles atomic persistence.
 */
public class RecommendationService {

    private final SkillGapService skillGapService;
    private final RecommendationRepository recommendationRepository;

    public RecommendationService(SkillGapService skillGapService, RecommendationRepository recommendationRepository) {
        this.skillGapService = skillGapService;
        this.recommendationRepository = recommendationRepository;
    }

    public List<RecommendationDto> getRecommendations(int studentId, int jobId) {
        // 1. Perform skill gap analysis
        SkillGapResponse gapResponse = skillGapService.analyzeSkillGap(studentId, jobId);

        // 2. Generate deterministic recommendations for each GAP
        List<Recommendation> entityList = new ArrayList<>();
        List<RecommendationDto> dtoList = new ArrayList<>();

        for (SkillAnalysisDto skill : gapResponse.getSkills()) {
            if (!"GAP".equalsIgnoreCase(skill.getStatus())) {
                continue;
            }

            int skillId = skill.getSkillId();
            String skillName = skill.getSkillName();
            int currentLevel = skill.getCurrentLevel();
            int targetLevel = skill.getRequiredLevel();
            int gap = skill.getGap();
            boolean mandatory = skill.isMandatory();

            String priority;
            String reason;

            if (mandatory) {
                if (currentLevel == 0) {
                    priority = "HIGH";
                    reason = "Mandatory job requirement (missing skill)";
                } else if (gap >= 2) {
                    priority = "HIGH";
                    reason = "Mandatory job requirement (large proficiency gap)";
                } else {
                    priority = "MEDIUM";
                    reason = "Mandatory job requirement (minor proficiency gap)";
                }
            } else {
                if (gap >= 2) {
                    priority = "MEDIUM";
                    reason = "Optional skill gap (recommended for competitive edge)";
                } else {
                    priority = "LOW";
                    reason = "Optional skill gap (nice to have)";
                }
            }

            Recommendation rec = new Recommendation(0, studentId, jobId, skillId, priority, reason);
            rec.setSkillName(skillName);
            rec.setCurrentLevel(currentLevel);
            rec.setTargetLevel(targetLevel);
            rec.setGap(gap);
            entityList.add(rec);

            dtoList.add(new RecommendationDto(
                    skillId,
                    skillName,
                    currentLevel,
                    targetLevel,
                    gap,
                    priority,
                    reason
            ));
        }

        // 3. Atomically persist fresh recommendations (replacing outdated ones in a single transaction)
        recommendationRepository.replaceRecommendations(studentId, jobId, entityList);

        return dtoList;
    }
}
