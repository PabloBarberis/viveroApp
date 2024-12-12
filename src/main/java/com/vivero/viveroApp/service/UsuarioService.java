package com.vivero.viveroApp.service;

import com.vivero.viveroApp.model.Usuario;
import com.vivero.viveroApp.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public List<Usuario> getAllUsuarios() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> getUsuarioById(Long id) {
        return usuarioRepository.findById(id);
    }

    public Usuario saveUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public void deleteUsuarioById(Long id) {
        usuarioRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return usuarioRepository.existsById(id);
    }

}
