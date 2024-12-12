package com.vivero.viveroApp.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.vivero.viveroApp.model.Producto;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
