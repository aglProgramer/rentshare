package com.rentshare.repository;

import com.rentshare.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMember.GroupMemberId> {
}
