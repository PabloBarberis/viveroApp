package com.vivero.viveroApp.repository;

import com.vivero.viveroApp.model.Gasto;
import com.vivero.viveroApp.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface GastoRepository extends JpaRepository<Gasto, Long> {
    List<Gasto> findByUsuarioAndFechaBetween(Usuario usuario, LocalDate startDate, LocalDate endDate);

    @Override
    Optional<Gasto> findById(Long id);
}
