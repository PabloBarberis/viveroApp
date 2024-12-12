package com.vivero.viveroApp.controller;

import com.vivero.viveroApp.model.Usuario;
import com.vivero.viveroApp.service.UsuarioService;
import java.util.HashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Controller
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

//    // Mostrar todos los usuarios
//    @GetMapping("/listar")
//    public String listarUsuarios(Model model) {
//        List<Usuario> usuarios = usuarioService.getAllUsuarios();
//        model.addAttribute("usuarios", usuarios);
//        return "usuarios/listar-usuarios";
//    }

    // Mostrar formulario para crear un nuevo usuario
    @GetMapping("/crear")
    public String mostrarFormularioCrear(Model model) {
        model.addAttribute("usuario", new Usuario());
        return "usuarios/crear-usuario";
    }

    // Crear un nuevo usuario
    @PostMapping("/crear")
    @ResponseBody
    public Map<String, Object> crearUsuario(@RequestBody Usuario usuario) {
        Map<String, Object> response = new HashMap<>();
        Usuario savedUsuario = usuarioService.saveUsuario(usuario);
        response.put("success", true);
        response.put("usuario", savedUsuario);
        return response;
    }

    // Mostrar formulario para editar un usuario
    @GetMapping("/editar/{id}")
    public String mostrarFormularioEditar(@PathVariable Long id, Model model) {
        Optional<Usuario> usuario = usuarioService.getUsuarioById(id);
        if (usuario.isPresent()) {
            model.addAttribute("usuario", usuario.get());
            return "usuarios/editar-usuario";
        } else {
            return "redirect:/usuarios/listar";
        }
    }

    // Actualizar un usuario existente
    @PostMapping("/actualizar")
    public String actualizarUsuario(@ModelAttribute Usuario usuario) {
        usuarioService.saveUsuario(usuario);
        return "redirect:/usuarios/listar";
    }

   

    @GetMapping("/listar")
    @ResponseBody
    public List<Usuario> listarUsuarios() {
        return usuarioService.getAllUsuarios();
    }

    @DeleteMapping("/eliminar/{id}")
    @ResponseBody
    public Map<String, Object> eliminarUsuario(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        if (!usuarioService.existsById(id)) {
            response.put("success", false);
            response.put("message", "Usuario no encontrado");
            return response;
        }
        usuarioService.deleteUsuarioById(id);
        response.put("success", true);
        return response;
    }
}
