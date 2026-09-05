package com.skillgap.model;

/**
 * Domain model representing a Student's evaluated Skill and proficiency.
 * Maps to MySQL table 'student_skills'.
 */
public class StudentSkill {
    private int studentId;
    private int skillId;
    private int proficiency; // 1 to 5
    private String skillName;
    private String category;

    public StudentSkill() {
    }

    public StudentSkill(int studentId, int skillId, int proficiency) {
        this.studentId = studentId;
        this.skillId = skillId;
        this.proficiency = proficiency;
    }

    public StudentSkill(int studentId, int skillId, int proficiency, String skillName, String category) {
        this.studentId = studentId;
        this.skillId = skillId;
        this.proficiency = proficiency;
        this.skillName = skillName;
        this.category = category;
    }

    public int getStudentId() {
        return studentId;
    }

    public void setStudentId(int studentId) {
        this.studentId = studentId;
    }

    public int getSkillId() {
        return skillId;
    }

    public void setSkillId(int skillId) {
        this.skillId = skillId;
    }

    public int getProficiency() {
        return proficiency;
    }

    public void setProficiency(int proficiency) {
        this.proficiency = proficiency;
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
