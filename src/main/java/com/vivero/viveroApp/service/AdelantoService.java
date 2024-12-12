package com.vivero.viveroApp.service;

import com.vivero.viveroApp.model.Adelanto;
import com.vivero.viveroApp.repository.AdelantoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdelantoService {

    @Autowired
    private AdelantoRepository adelantoRepository;

    // Obtener todos los adelantos
    public List<Adelanto> getAllAdelantos() {
        return adelantoRepository.findAll();
    }

    // Guardar un adelanto
    public Adelanto saveAdelanto(Adelanto adelanto) {
        return adelantoRepository.save(adelanto);
    }

    // Obtener un adelanto por ID
    public Optional<Adelanto> getAdelantoById(Long id) {
        return adelantoRepository.findById(id);
    }

    // Eliminar un adelanto por ID
    public void deleteAdelanto(Long id) {
        adelantoRepository.deleteById(id);
    }
}
