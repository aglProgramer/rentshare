package com.rentshare.service;

import com.rentshare.model.Group;
import com.rentshare.model.GroupMember;
import com.rentshare.model.Profile;
import com.rentshare.repository.GroupMemberRepository;
import com.rentshare.repository.GroupRepository;
import com.rentshare.repository.ProfileRepository;
import com.rentshare.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final ProfileRepository profileRepository;
    private final GroupMemberRepository groupMemberRepository;

    private Profile getAuthenticatedUser() {
        String userIdStr = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return profileRepository.findById(UUID.fromString(userIdStr))
                .orElseThrow(() -> new ResourceNotFoundException("Perfil no encontrado para el usuario actual"));
    }

    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    public Group getGroupById(UUID id) {
        return groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grupo no encontrado"));
    }

    public Group createGroup(Group group) {
        Profile currentUser = getAuthenticatedUser();
        group.setCreatedBy(currentUser);
        group.setCreatedAt(ZonedDateTime.now());
        group.setUpdatedAt(ZonedDateTime.now());
        Group savedGroup = groupRepository.save(group);
        addMember(savedGroup.getId(), currentUser.getId()); // Creator is member
        return savedGroup;
    }

    public GroupMember addMember(UUID groupId, UUID profileId) {
        Group group = getGroupById(groupId);
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil no encontrado"));

        GroupMember member = new GroupMember();
        member.setGroup(group);
        member.setProfile(profile);
        member.setJoinedAt(ZonedDateTime.now());
        
        return groupMemberRepository.save(member);
    }
}
