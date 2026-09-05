package com.skillgap.dto;

public class StudentSkillRequest {
    private Integer skillId;
    private String skillName;
    private Integer proficiency; // 1 to 5

    public StudentSkillRequest() {
    }

    public StudentSkillRequest(Integer skillId, Integer proficiency) {
        this.skillId = skillId;
        this.proficiency = proficiency;
    }

    public StudentSkillRequest(Integer skillId, String skillName, Integer proficiency) {
        this.skillId = skillId;
        this.skillName = skillName;
        this.proficiency = proficiency;
    }

    public Integer getSkillId() {
        return skillId;
    }

    public void setSkillId(Integer skillId) {
        this.skillId = skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public Integer getProficiency() {
        return proficiency;
    }

    public void setProficiency(Integer proficiency) {
        this.proficiency = proficiency;
    }
}
