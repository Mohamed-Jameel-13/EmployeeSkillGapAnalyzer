package com.skillgap.model;

/**
 * Domain model representing a Skill in the catalog.
 * Maps to MySQL table 'skills'.
 */
public class Skill {
    private int skillId;
    private String name;
    private String category;

    public Skill() {
    }

    public Skill(int skillId, String name, String category) {
        this.skillId = skillId;
        this.name = name;
        this.category = category;
    }

    public int getSkillId() {
        return skillId;
    }

    public void setSkillId(int skillId) {
        this.skillId = skillId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
