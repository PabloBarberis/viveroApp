package com.vivero.viveroApp.service;

import com.vivero.viveroApp.model.Producto;
import com.vivero.viveroApp.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class ProductoService {

    public Producto saveProducto(Producto producto) {
        return productoRepository.save(producto);
    }

    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> getAllProductos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> getProductoById(Long id) {
        return productoRepository.findById(id);
    }
}
