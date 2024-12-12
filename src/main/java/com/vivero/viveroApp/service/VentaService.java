package com.vivero.viveroApp.service;

import com.vivero.viveroApp.model.Venta;
import com.vivero.viveroApp.model.VentaProducto;
import com.vivero.viveroApp.model.Producto;
import com.vivero.viveroApp.repository.ProductoRepository;
import com.vivero.viveroApp.repository.VentaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class VentaService {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private VentaRepository ventaRepository;

    public Optional<Venta> getVentaById(Long id) {
        return ventaRepository.findById(id);
    }

    @Transactional
    public Venta createVenta(Venta venta) {
        validarStock(venta);  // Validación de stock

        for (VentaProducto ventaProducto : venta.getProductos()) {
            Producto producto = ventaProducto.getProducto();
            int nuevaCantidad = producto.getStock() - ventaProducto.getCantidad();
            if (nuevaCantidad < 0) {
                throw new IllegalArgumentException("Cantidad solicitada excede el stock disponible para el producto: " + producto.getNombre());
            }
            producto.setStock(nuevaCantidad);
            productoRepository.save(producto);
        }
        if (venta.getTotal() == null || venta.getTotal() == 0) {
            venta.calcularTotal();
        }
        return ventaRepository.save(venta);
    }

    @Transactional
    public Venta updateVenta(Venta venta) {
        validarStock(venta);  // Validación de stock

        if (venta.getTotal() == null || venta.getTotal() == 0) {
            venta.calcularTotal();
        }
        return ventaRepository.save(venta);
    }

    @Transactional
    public void deleteVenta(Long id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Venta no encontrada con id: " + id));
        ventaRepository.delete(venta);
    }

    @Transactional(readOnly = true)
    public Page<Venta> getAllVentas(Pageable pageable) {
        return ventaRepository.findAll(pageable);
    }

    // Método para validar el stock de los productos
    private void validarStock(Venta venta) {
        for (VentaProducto ventaProducto : venta.getProductos()) {
            Producto producto = ventaProducto.getProducto();
            if (ventaProducto.getCantidad() > producto.getStock()) {
                throw new IllegalArgumentException("Cantidad solicitada excede el stock disponible para el producto: " + producto.getNombre());
            }
        }
    }
}
