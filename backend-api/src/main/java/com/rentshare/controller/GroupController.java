package com.rentshare.controller;

import com.rentshare.model.Group;
import com.rentshare.model.GroupMember;
import com.rentshare.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    public ResponseEntity<List<Group>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroupById(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }

    @PostMapping
    public ResponseEntity<Group> createGroup(@RequestBody Group group) {
        return ResponseEntity.status(HttpStatus.CREATED).body(groupService.createGroup(group));
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<GroupMember> addMember(@PathVariable UUID id, @RequestBody GroupMember member) {
        return ResponseEntity.status(HttpStatus.CREATED).body(groupService.addMember(id, member.getProfile().getId()));
    }
}
