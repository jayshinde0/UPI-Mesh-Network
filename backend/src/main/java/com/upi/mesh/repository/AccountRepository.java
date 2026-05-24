package com.upi.mesh.repository;

import com.upi.mesh.entity.Account;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    Optional<Account> findByUserId(String userId);
    Optional<Account> findByAccountNumber(String accountNumber);

    @Lock(LockModeType.OPTIMISTIC)
    @Query("SELECT a FROM Account a WHERE a.user.id = :userId")
    Optional<Account> findByUserIdWithLock(@Param("userId") String userId);

    @Query("SELECT a FROM Account a WHERE a.user.upiId = :upiId")
    Optional<Account> findByUserUpiId(@Param("upiId") String upiId);
}
