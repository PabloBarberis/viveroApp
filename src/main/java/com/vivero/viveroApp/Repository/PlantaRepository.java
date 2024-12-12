package com.vivero.viveroApp.repository;

import com.vivero.viveroApp.model.Planta;
import com.vivero.viveroApp.model.enums.TipoPlanta;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlantaRepository extends JpaRepository<Planta, Long> {

    // Buscar todas las plantas activas con paginación
    Page<Planta> findByActivoTrue(Pageable pageable);

    // Buscar plantas por nombre y tipo con paginación
    Page<Planta> findByNombreContainingIgnoreCaseAndTipoAndActivoTrue(String nombre, TipoPlanta tipo, Pageable pageable);

    // Buscar plantas por nombre con paginación
    Page<Planta> findByNombreContainingIgnoreCaseAndActivoTrue(String nombre, Pageable pageable);

    // Buscar plantas por tipo con paginación
    Page<Planta> findByTipoAndActivoTrue(TipoPlanta tipo, Pageable pageable);
}
