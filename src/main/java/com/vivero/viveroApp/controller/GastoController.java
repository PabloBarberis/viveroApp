package com.vivero.viveroApp.controller;

import com.vivero.viveroApp.model.Gasto;
import com.vivero.viveroApp.service.GastoService;
import com.vivero.viveroApp.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/gastos")
public class GastoController {

    @Autowired
    private GastoService gastoService;

    @Autowired
    private UsuarioService usuarioService;

    
    
    @GetMapping("/cargarGastos")
    public ResponseEntity<Map<String, Object>> cargarGastos(@RequestParam Long usuarioId, @RequestParam int mes, @RequestParam int año) {
        Map<String, Object> response = new HashMap<>();
        List<Gasto> gastos = gastoService.getGastosByUsuarioAndMesAndAño(usuarioId, mes, año);
        response.put("success", true);
        response.put("gastos", gastos);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/guardar")
    public Map<String, Object> guardarGasto(@RequestBody Gasto gasto) {
        Map<String, Object> response = new HashMap<>();
        Gasto savedGasto = gastoService.saveGasto(gasto);
        response.put("success", true);
        response.put("gasto", savedGasto);
        return response;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Gasto> getGastoById(@PathVariable Long id) {
        Optional<Gasto> gasto = gastoService.findById(id);
        if (gasto.isPresent()) {
            return ResponseEntity.ok(gasto.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
@PutMapping("/editar")
@ResponseBody
public Map<String, Object> editarGasto(@RequestBody Gasto gasto) {
    Map<String, Object> response = new HashMap<>();
    if (gasto.getId() == null || !gastoService.existsById(gasto.getId())) {
        response.put("success", false);
        response.put("message", "Gasto no encontrado");
        return response;
    }

    Gasto updatedGasto = gastoService.saveGasto(gasto);
    response.put("success", true);
    response.put("gasto", updatedGasto);
    return response;
}


    @DeleteMapping("/eliminar")
    public Map<String, Object> eliminarGasto(@RequestParam("id") Long id) {
        Map<String, Object> response = new HashMap<>();
        if (!gastoService.existsById(id)) {
            response.put("success", false);
            response.put("message", "Gasto no encontrado");
            return response;
        }

        gastoService.deleteById(id);
        response.put("success", true);
        return response;
    }
}
