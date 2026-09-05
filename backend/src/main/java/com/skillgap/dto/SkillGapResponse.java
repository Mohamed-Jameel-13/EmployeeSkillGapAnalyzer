package com.skillgap.dto;

import java.util.List;

public class SkillGapResponse {
    private int studentId;
    private int jobId;
    private int overallMatchPercent;
    private List<SkillAnalysisDto> skills;

    public SkillGapResponse() {
    }

    public SkillGapResponse(int studentId, int jobId, int overallMatchPercent, List<SkillAnalysisDto> skills) {
        this.studentId = studentId;
        this.jobId = jobId;
        this.overallMatchPercent = overallMatchPercent;
        this.skills = skills;
    }

    public int getStudentId() {
        return studentId;
    }

    public void setStudentId(int studentId) {
        this.studentId = studentId;
    }

    public int getJobId() {
        return jobId;
    }

    public void setJobId(int jobId) {
        this.jobId = jobId;
    }

    public int getOverallMatchPercent() {
        return overallMatchPercent;
    }

    public void setOverallMatchPercent(int overallMatchPercent) {
        this.overallMatchPercent = overallMatchPercent;
    }

    public List<SkillAnalysisDto> getSkills() {
        return skills;
    }

    public void setSkills(List<SkillAnalysisDto> skills) {
        this.skills = skills;
    }
}
