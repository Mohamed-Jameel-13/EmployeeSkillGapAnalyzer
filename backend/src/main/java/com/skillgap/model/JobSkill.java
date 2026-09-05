package com.skillgap.model;

/**
 * Domain model representing a Skill requirement for a Job.
 * Maps to MySQL table 'job_skills'.
 */
public class JobSkill {
    private int jobId;
    private int skillId;
    private int requiredLevel; // 1 to 5
    private boolean mandatory;
    private String skillName;
    private String category;

    public JobSkill() {
    }

    public JobSkill(int jobId, int skillId, int requiredLevel, boolean mandatory) {
        this.jobId = jobId;
        this.skillId = skillId;
        this.requiredLevel = requiredLevel;
        this.mandatory = mandatory;
    }

    public JobSkill(int jobId, int skillId, int requiredLevel, boolean mandatory, String skillName, String category) {
        this.jobId = jobId;
        this.skillId = skillId;
        this.requiredLevel = requiredLevel;
        this.mandatory = mandatory;
        this.skillName = skillName;
        this.category = category;
    }

    public int getJobId() {
        return jobId;
    }

    public void setJobId(int jobId) {
        this.jobId = jobId;
    }

    public int getSkillId() {
        return skillId;
    }

    public void setSkillId(int skillId) {
        this.skillId = skillId;
    }

    public int getRequiredLevel() {
        return requiredLevel;
    }

    public void setRequiredLevel(int requiredLevel) {
        this.requiredLevel = requiredLevel;
    }

    public boolean isMandatory() {
        return mandatory;
    }

    public void setMandatory(boolean mandatory) {
        this.mandatory = mandatory;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
