package com.ucms.repository;

import com.ucms.model.Scheme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SchemeRepository extends JpaRepository<Scheme, Long> {
    Optional<Scheme> findBySchemeId(String schemeId);
    List<Scheme> findByActiveTrue();
    boolean existsBySchemeId(String schemeId);
}
