package com.skillgap.dto;

import java.util.List;

public class DashboardSummaryDto {
    private int totalStudents;
    private int totalJobs;
    private int totalApplications;
    private int averageSkillMatch;
    private List<TopSkillGapDto> topSkillGaps;

    public DashboardSummaryDto() {
    }

    public DashboardSummaryDto(int totalStudents, int totalJobs, int totalApplications, int averageSkillMatch, List<TopSkillGapDto> topSkillGaps) {
        this.totalStudents = totalStudents;
        this.totalJobs = totalJobs;
        this.totalApplications = totalApplications;
        this.averageSkillMatch = averageSkillMatch;
        this.topSkillGaps = topSkillGaps;
    }

    public int getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(int totalStudents) {
        this.totalStudents = totalStudents;
    }

    public int getTotalJobs() {
        return totalJobs;
    }

    public void setTotalJobs(int totalJobs) {
        this.totalJobs = totalJobs;
    }

    public int getTotalApplications() {
        return totalApplications;
    }

    public void setTotalApplications(int totalApplications) {
        this.totalApplications = totalApplications;
    }

    public int getAverageSkillMatch() {
        return averageSkillMatch;
    }

    public void setAverageSkillMatch(int averageSkillMatch) {
        this.averageSkillMatch = averageSkillMatch;
    }

    public List<TopSkillGapDto> getTopSkillGaps() {
        return topSkillGaps;
    }

    public void setTopSkillGaps(List<TopSkillGapDto> topSkillGaps) {
        this.topSkillGaps = topSkillGaps;
    }
}
