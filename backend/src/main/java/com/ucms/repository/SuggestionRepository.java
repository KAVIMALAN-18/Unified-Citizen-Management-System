package com.ucms.repository;

import com.ucms.model.Suggestion;
import com.ucms.model.SuggestionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SuggestionRepository extends JpaRepository<Suggestion, Long> {
    Optional<Suggestion> findBySuggestionId(String suggestionId);
    List<Suggestion> findByCitizenIdOrderByCreatedAtDesc(Long citizenId);
    List<Suggestion> findAllByOrderByCreatedAtDesc();
    long countByStatus(SuggestionStatus status);
}
