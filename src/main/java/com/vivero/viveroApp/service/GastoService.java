package com.vivero.viveroApp.service;

import com.vivero.viveroApp.model.Gasto;
import com.vivero.viveroApp.model.Usuario;
import com.vivero.viveroApp.repository.GastoRepository;
import com.vivero.viveroApp.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class GastoService {

    @Autowired
    private GastoRepository gastoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Gasto> getGastosByUsuarioAndMesAndAño(Long usuarioId, int mes, int año) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        LocalDate startDate = LocalDate.of(año, mes, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return gastoRepository.findByUsuarioAndFechaBetween(usuario, startDate, endDate);
    }

    public Gasto saveGasto(Gasto gasto) {
        return gastoRepository.save(gasto);
    }

    public boolean existsById(Long id) {
        return gastoRepository.existsById(id);
    }

    public void deleteById(Long id) {
        gastoRepository.deleteById(id);
    }

    public Optional<Gasto> findById(Long id) {
        return gastoRepository.findById(id);
    }
}
