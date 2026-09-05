package com.skillgap.dto;

public class TopSkillGapDto {
    private int skillId;
    private String skillName;
    private int count;

    public TopSkillGapDto() {
    }

    public TopSkillGapDto(int skillId, String skillName, int count) {
        this.skillId = skillId;
        this.skillName = skillName;
        this.count = count;
    }

    public int getSkillId() {
        return skillId;
    }

    public void setSkillId(int skillId) {
        this.skillId = skillId;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }
}
