package com.vivero.viveroApp.service;
import com.vivero.viveroApp.model.Adelanto;
import com.vivero.viveroApp.model.Usuario;
import com.vivero.viveroApp.repository.AdelantoRepository;
import java.time.LocalDate;
import java.time.YearMonth;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdelantoService {

    private final AdelantoRepository adelantoRepository;

    @Autowired
    public AdelantoService(AdelantoRepository adelantoRepository) {
        this.adelantoRepository = adelantoRepository;
    }

    public List<Adelanto> getAdelantosByUsuarioAndMesAndAño(Usuario usuario, int mes, int año) {
        LocalDate startDate = LocalDate.of(año, mes, 1);
        LocalDate endDate = YearMonth.of(año, mes).atEndOfMonth();
        return adelantoRepository.findByUsuarioAndFechaBetween(usuario, startDate, endDate);
    }

    public Adelanto saveAdelanto(Adelanto adelanto) {
        return adelantoRepository.save(adelanto);
    }

    public void deleteAdelanto(Long id) {
        adelantoRepository.deleteById(id);
    }

    public Optional<Adelanto> findById(Long id) {
        return adelantoRepository.findById(id);
    }

    public boolean existsById(Long id) {
        return adelantoRepository.existsById(id);
    }

}
