package com.ucms.repository;

import com.ucms.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByFinancialYear(String financialYear);
    Optional<Budget> findTopByOrderByFinancialYearDesc();
}
