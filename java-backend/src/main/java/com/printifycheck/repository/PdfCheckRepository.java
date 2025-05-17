
package com.printifycheck.repository;

import com.printifycheck.entity.PdfCheckEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface PdfCheckRepository extends JpaRepository<PdfCheckEntity, UUID> {
    // Basic queries
    List<PdfCheckEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<PdfCheckEntity> findByStatus(String status);
    List<PdfCheckEntity> findByUserIdAndStatus(UUID userId, String status);
    
    // Paging and filtering
    Page<PdfCheckEntity> findByUserId(UUID userId, Pageable pageable);
    Page<PdfCheckEntity> findByUserIdAndStatusIn(UUID userId, List<String> statuses, Pageable pageable);
    
    // Advanced filtering
    @Query("SELECT p FROM PdfCheckEntity p WHERE p.userId = :userId AND (:fileName IS NULL OR p.fileName LIKE %:fileName%) AND (:status IS NULL OR p.status = :status) ORDER BY p.createdAt DESC")
    Page<PdfCheckEntity> findByUserIdAndFilters(
        @Param("userId") UUID userId,
        @Param("fileName") String fileName,
        @Param("status") String status,
        Pageable pageable
    );
    
    // Recent checks
    List<PdfCheckEntity> findByUserIdAndCreatedAtAfter(UUID userId, OffsetDateTime after);
    
    // Quality score related queries
    List<PdfCheckEntity> findByUserIdAndQualityScoreGreaterThanEqual(UUID userId, Integer minQualityScore);
    List<PdfCheckEntity> findByUserIdAndQualityScoreLessThan(UUID userId, Integer maxQualityScore);
    
    // Project based queries
    List<PdfCheckEntity> findByProjectIdOrderByCreatedAtDesc(UUID projectId);
    Page<PdfCheckEntity> findByProjectId(UUID projectId, Pageable pageable);
    
    // Dashboard stats queries
    @Query("SELECT COUNT(p) FROM PdfCheckEntity p WHERE p.userId = :userId AND p.createdAt >= :startDate")
    long countChecksByUserSince(@Param("userId") UUID userId, @Param("startDate") OffsetDateTime startDate);
    
    @Query("SELECT AVG(p.qualityScore) FROM PdfCheckEntity p WHERE p.userId = :userId AND p.createdAt >= :startDate AND p.qualityScore IS NOT NULL")
    Double averageQualityScoreByUserSince(@Param("userId") UUID userId, @Param("startDate") OffsetDateTime startDate);
    
    // Processing related queries
    List<PdfCheckEntity> findByStatusOrderByCreatedAtAsc(String status);
    
    @Query("SELECT p FROM PdfCheckEntity p WHERE p.status = :status AND p.createdAt < :threshold ORDER BY p.createdAt ASC")
    List<PdfCheckEntity> findStaleChecks(@Param("status") String status, @Param("threshold") OffsetDateTime threshold);
    
    // Find checks with issues count higher than threshold
    List<PdfCheckEntity> findByUserIdAndIssuesCountGreaterThan(UUID userId, Integer threshold);
    
    // Batch operations for scalability
    @Query("SELECT p.id FROM PdfCheckEntity p WHERE p.createdAt < :threshold AND p.status IN :statuses")
    Set<UUID> findIdsForBatchCleanup(@Param("threshold") OffsetDateTime threshold, @Param("statuses") List<String> statuses);
    
    // Find by id with optimistic locking
    @Query("SELECT p FROM PdfCheckEntity p WHERE p.id = :id")
    Optional<PdfCheckEntity> findByIdWithLock(@Param("id") UUID id);
}
