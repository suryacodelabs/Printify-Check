
package com.printifycheck.repository;

import com.printifycheck.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {
    List<Job> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Job> findByStatus(String status);
    List<Job> findByUserIdAndStatus(UUID userId, String status);
    List<Job> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, String status);
}
