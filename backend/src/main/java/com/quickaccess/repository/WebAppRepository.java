package com.quickaccess.repository;

import com.quickaccess.entity.WebApp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WebAppRepository extends JpaRepository<WebApp, Long> {
    List<WebApp> findAllByOrderByCreatedAtDesc();
}

