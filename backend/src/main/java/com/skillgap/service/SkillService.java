package com.skillgap.service;

import com.skillgap.dto.CreateSkillRequest;
import com.skillgap.dto.SkillDto;
import com.skillgap.exception.ConflictException;
import com.skillgap.exception.ForbiddenException;
import com.skillgap.exception.NotFoundException;
import com.skillgap.exception.ValidationException;
import com.skillgap.model.Skill;
import com.skillgap.repository.SkillRepository;
import com.skillgap.security.UserPrincipal;

import java.util.ArrayList;
import java.util.List;

public class SkillService {

    private final SkillRepository skillRepository;

    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    public List<SkillDto> getAllSkills() {
        List<Skill> skills = skillRepository.findAll();
        List<SkillDto> dtos = new ArrayList<>();
        for (Skill s : skills) {
            dtos.add(new SkillDto(s.getSkillId(), s.getName(), s.getCategory()));
        }
        return dtos;
    }

    public SkillDto getSkillById(int skillId) {
        Skill s = skillRepository.findById(skillId);
        if (s == null) {
            throw new NotFoundException("Skill not found with ID: " + skillId);
        }
        return new SkillDto(s.getSkillId(), s.getName(), s.getCategory());
    }

    public SkillDto createSkill(CreateSkillRequest request, UserPrincipal currentUser) {
        requireAdmin(currentUser);
        if (request == null || request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ValidationException("Skill name is required");
        }
        if (request.getCategory() == null || request.getCategory().trim().isEmpty()) {
            throw new ValidationException("Skill category is required");
        }

        Skill existing = skillRepository.findByName(request.getName().trim());
        if (existing != null) {
            throw new ConflictException("Skill '" + request.getName().trim() + "' already exists");
        }

        Skill created = skillRepository.create(new Skill(0, request.getName().trim(), request.getCategory().trim()));
        return new SkillDto(created.getSkillId(), created.getName(), created.getCategory());
    }

    public SkillDto updateSkill(int skillId, CreateSkillRequest request, UserPrincipal currentUser) {
        requireAdmin(currentUser);
        Skill existing = skillRepository.findById(skillId);
        if (existing == null) {
            throw new NotFoundException("Skill not found with ID: " + skillId);
        }

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            Skill byName = skillRepository.findByName(request.getName().trim());
            if (byName != null && byName.getSkillId() != skillId) {
                throw new ConflictException("Skill name '" + request.getName().trim() + "' is already in use");
            }
            existing.setName(request.getName().trim());
        }
        if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
            existing.setCategory(request.getCategory().trim());
        }

        Skill updated = skillRepository.update(existing);
        return new SkillDto(updated.getSkillId(), updated.getName(), updated.getCategory());
    }

    public boolean deleteSkill(int skillId, UserPrincipal currentUser) {
        requireAdmin(currentUser);
        Skill existing = skillRepository.findById(skillId);
        if (existing == null) {
            throw new NotFoundException("Skill not found with ID: " + skillId);
        }
        return skillRepository.delete(skillId);
    }

    private void requireAdmin(UserPrincipal currentUser) {
        if (currentUser == null || !currentUser.isAdmin()) {
            throw new ForbiddenException("Access denied: Administrative privilege required");
        }
    }
}
