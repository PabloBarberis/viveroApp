package com.vivero.viveroApp.service;

import com.vivero.viveroApp.model.RegistroHorario;
import com.vivero.viveroApp.model.Usuario;
import com.vivero.viveroApp.repository.RegistroHorarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class RegistroHorarioService {

    private final RegistroHorarioRepository registroHorarioRepository;

    @Autowired
    public RegistroHorarioService(RegistroHorarioRepository registroHorarioRepository) {
        this.registroHorarioRepository = registroHorarioRepository;
    }

    public List<RegistroHorario> getAllRegistros() {
        return registroHorarioRepository.findAll();
    }

    public Optional<RegistroHorario> getRegistroById(Long id) {
        return registroHorarioRepository.findById(id);
    }

    public List<RegistroHorario> getRegistrosByUsuarioAndMesAndAño(Usuario usuario, int mes, int año) {
        LocalDate startDate = LocalDate.of(año, mes, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return registroHorarioRepository.findByUsuarioAndFechaBetween(usuario, startDate, endDate);
    }

    public RegistroHorario saveRegistro(RegistroHorario registroHorario) {
        return registroHorarioRepository.save(registroHorario);
    }

    public void deleteRegistroById(Long id) {
        registroHorarioRepository.deleteById(id);
    }
}
