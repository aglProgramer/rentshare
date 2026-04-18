package com.rentshare.service;

import com.rentshare.model.Category;
import com.rentshare.model.Profile;
import com.rentshare.repository.CategoryRepository;
import com.rentshare.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProfileRepository profileRepository;

    private Profile getAuthenticatedUser() {
        String userIdStr = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return profileRepository.findById(UUID.fromString(userIdStr)).orElse(null);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category createCategory(Category category) {
        Profile currentUser = getAuthenticatedUser();
        category.setCreatedBy(currentUser);
        category.setCreatedAt(ZonedDateTime.now());
        return categoryRepository.save(category);
    }
}
