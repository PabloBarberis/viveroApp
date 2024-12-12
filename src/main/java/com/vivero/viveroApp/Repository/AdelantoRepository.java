package com.vivero.viveroApp.repository;

import com.vivero.viveroApp.model.Adelanto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdelantoRepository extends JpaRepository<Adelanto, Long> {
}
