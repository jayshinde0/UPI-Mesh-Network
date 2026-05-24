package com.upi.mesh.repository;

import com.upi.mesh.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    Optional<Transaction> findByTransactionHash(String hash);
    boolean existsByTransactionHash(String hash);

    Page<Transaction> findBySenderIdOrReceiverIdOrderByCreatedAtDesc(
        String senderId, String receiverId, Pageable pageable);

    @Query("SELECT t FROM Transaction t WHERE t.sender.id = :userId OR t.receiver.id = :userId ORDER BY t.createdAt DESC")
    List<Transaction> findAllByUserId(@Param("userId") String userId);

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.status = 'SETTLED'")
    long countSettled();

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.status = 'DUPLICATE'")
    long countDuplicates();

    @Query("SELECT COUNT(t) FROM Transaction t WHERE t.status = 'TAMPERED'")
    long countTampered();

    @Query("SELECT t FROM Transaction t WHERE t.createdAt >= :since ORDER BY t.createdAt DESC")
    List<Transaction> findRecentTransactions(@Param("since") LocalDateTime since);

    @Query("SELECT DATE_TRUNC('minute', t.createdAt) as minute, COUNT(t) as count " +
           "FROM Transaction t WHERE t.createdAt >= :since GROUP BY DATE_TRUNC('minute', t.createdAt) ORDER BY minute")
    List<Object[]> countTransactionsPerMinute(@Param("since") LocalDateTime since);
}
