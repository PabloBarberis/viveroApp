package com.vivero.viveroApp.controller;

import com.vivero.viveroApp.model.Adelanto;
import com.vivero.viveroApp.model.Usuario;
import com.vivero.viveroApp.service.AdelantoService;
import com.vivero.viveroApp.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/adelantos")
public class AdelantoController {

    @Autowired
    private AdelantoService adelantoService;

    @Autowired
    private UsuarioService usuarioService;

    // Mostrar todos los adelantos
    @GetMapping("/listar")
    public String listarAdelantos(Model model) {
        List<Adelanto> adelantos = adelantoService.getAllAdelantos();
        model.addAttribute("adelantos", adelantos);
        return "adelantos/listar-adelantos";
    }

    // Mostrar formulario para crear un nuevo adelanto
    @GetMapping("/crear")
    public String mostrarFormularioCrear(Model model) {
        List<Usuario> usuarios = usuarioService.getAllUsuarios();
        model.addAttribute("adelanto", new Adelanto());
        model.addAttribute("usuarios", usuarios);
        return "adelantos/crear-adelanto";
    }

    // Crear un nuevo adelanto
    @PostMapping("/crear")
    public String crearAdelanto(@ModelAttribute Adelanto adelanto) {
        adelantoService.saveAdelanto(adelanto);
        return "redirect:/adelantos/listar";
    }

    // Mostrar formulario para editar un adelanto
    @GetMapping("/editar/{id}")
    public String mostrarFormularioEditar(@PathVariable Long id, Model model) {
        Optional<Adelanto> adelanto = adelantoService.getAdelantoById(id);
        if (adelanto.isPresent()) {
            List<Usuario> usuarios = usuarioService.getAllUsuarios();
            model.addAttribute("adelanto", adelanto.get());
            model.addAttribute("usuarios", usuarios);
            return "adelantos/editar-adelanto";
        } else {
            return "redirect:/adelantos/listar";
        }
    }

    // Actualizar un adelanto existente
    @PostMapping("/actualizar")
    public String actualizarAdelanto(@ModelAttribute Adelanto adelanto) {
        adelantoService.saveAdelanto(adelanto);
        return "redirect:/adelantos/listar";
    }

    // Eliminar un adelanto
    @GetMapping("/eliminar/{id}")
    public String eliminarAdelanto(@PathVariable Long id) {
        adelantoService.deleteAdelanto(id);
        return "redirect:/adelantos/listar";
    }
}
