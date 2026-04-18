package com.rentshare.repository;

import com.rentshare.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;


public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMember.GroupMemberId> {
}
