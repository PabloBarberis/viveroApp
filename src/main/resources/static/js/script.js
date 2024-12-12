document.addEventListener('DOMContentLoaded', function () {
    var selectUsuario = document.getElementById('usuario');
    selectUsuario.addEventListener('change', cargarUsuario);

    // Cargar el mes y año corrientes por defecto
    var currentDate = new Date();
    document.getElementById('mes').value = currentDate.getMonth() + 1;
    document.getElementById('año').value = currentDate.getFullYear();

    // Configurar la fecha del día actual en el campo de fecha de gastos
    var fechaGastoInput = document.getElementById('fechaGasto');
    if (fechaGastoInput) {
        var today = new Date();
        var day = String(today.getDate()).padStart(2, '0');
        var month = String(today.getMonth() + 1).padStart(2, '0'); // Enero es 0
        var year = today.getFullYear();
        var todayString = year + '-' + month + '-' + day;
        fechaGastoInput.value = todayString;
    }
});

function cargarUsuario() {
    console.log('ENTRANDO A CARGAR USUARIO');

    var usuarioId = document.getElementById('usuario').value;
    var configuracion = document.getElementById('configuracion');
    configuracion.style.display = 'block';

    // Evitar llamadas duplicadas
    if (usuarioId !== configuracion.dataset.lastUserId) {
        configuracion.dataset.lastUserId = usuarioId;

        // Limpiar la tabla antes de cargar nuevos datos
        var tablaRegistros = document.getElementById('tablaRegistros');
        tablaRegistros.innerHTML = '';

        saludarUsuario(usuarioId);
    }
}


function saludarUsuario(usuarioId) {
    console.log('ENTRANDO A SALUDAR USUARIO');
    var usuario = document.querySelector('#usuario option[value="' + usuarioId + '"]').text;
    document.getElementById('saludo').innerText = 'Hola ' + usuario + '!';
    cargarDias(); // Solo llamamos a cargarDias aquí
    cargarGastos(); // Llamamos a cargarGastos aquí también
}





function cargarDias() {
    console.log('ENTRANDO A CARGAR DIAS');
    var usuarioId = document.getElementById('usuario').value;
    var mes = document.getElementById('mes').value;
    var año = document.getElementById('año').value;
    cargarDiasParaUsuario(usuarioId, mes, año);
}


function cargarDiasParaUsuario(usuarioId, mes, año) {
    console.log('ENTRANDO A CARGAR DIAS PARA USUARIO');
    console.log('Cargando días para:', usuarioId, mes, año);
    var tablaRegistros = document.getElementById('tablaRegistros');
    tablaRegistros.innerHTML = ''; // Limpiar tabla antes de cargar nuevos datos

    fetch(`/horas/cargarDias?usuarioId=${usuarioId}&mes=${mes}&año=${año}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    var diasEnMes = new Date(año, mes, 0).getDate();
                    for (var dia = 1; dia <= diasEnMes; dia++) {
                        var fecha = new Date(año, mes - 1, dia);
                        var diaSemana = fecha.toLocaleDateString('es-ES', {weekday: 'short'});
                        var registro = data.registros.find(r => r.fecha === `${año}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`) || {};

                        var fila = `
                    <tr>
                        <td>${dia}/${mes}/${año}</td>
                        <td>${diaSemana}</td>
                        <td><input type="time" class="form-control" name="entradaTM_${dia}" value="${registro.entradaTM || ''}" onchange="calcularTotalHoras(${dia})"></td>
                        <td><input type="time" class="form-control" name="salidaTM_${dia}" value="${registro.salidaTM || ''}" onchange="calcularTotalHoras(${dia})"></td>
                        <td><input type="time" class="form-control" name="entradaTT_${dia}" value="${registro.entradaTT || ''}" onchange="calcularTotalHoras(${dia})"></td>
                        <td><input type="time" class="form-control" name="salidaTT_${dia}" value="${registro.salidaTT || ''}" onchange="calcularTotalHoras(${dia})"></td>
                        <td><input type="number" class="form-control" name="totalHoras_${dia}" value="${registro.totalHoras || ''}" readonly></td>
                        <td><input type="checkbox" class="form-control" name="feriado_${dia}" ${registro.feriado ? 'checked' : ''} onchange="calcularTotal(${dia})"></td>
                        <td><input type="number" class="form-control" name="precioHora_${dia}" value="${registro.precioHora || ''}" onchange="calcularTotal(${dia})"></td>
                        <td><input type="number" class="form-control" name="total_${dia}" value="${registro.total || 0}" readonly></td>
                        <td><button class="btn btn-success" onclick="guardar(${dia}, ${registro.id !== undefined ? registro.id : 'null'})">Guardar</button></td>
                    </tr>
                `;

                        tablaRegistros.insertAdjacentHTML('beforeend', fila);
                        calcularTotal(dia); // Asegurarse de que el total se calcule y muestre al cargar los datos
                    }
                } else {
                    alert('Error al cargar los días.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al cargar los días.');
            });
}

function calcularTotalHoras(dia) {
    var entradaTM = document.querySelector(`[name="entradaTM_${dia}"]`).value;
    var salidaTM = document.querySelector(`[name="salidaTM_${dia}"]`).value;
    var entradaTT = document.querySelector(`[name="entradaTT_${dia}"]`).value;
    var salidaTT = document.querySelector(`[name="salidaTT_${dia}"]`).value;

    var totalHorasTM = calcularHoras(entradaTM, salidaTM);
    var totalHorasTT = calcularHoras(entradaTT, salidaTT);
    var totalHoras = totalHorasTM + totalHorasTT;

    document.querySelector(`[name="totalHoras_${dia}"]`).value = totalHoras.toFixed(2);

    // Calcular el total a pagar para el día
    calcularTotal(dia);
}

function calcularHoras(entrada, salida) {
    if (!entrada || !salida)
        return 0;

    var [entradaH, entradaM] = entrada.split(':').map(Number);
    var [salidaH, salidaM] = salida.split(':').map(Number);

    var entradaTotalMinutos = (entradaH * 60) + entradaM;
    var salidaTotalMinutos = (salidaH * 60) + salidaM;

    return (salidaTotalMinutos - entradaTotalMinutos) / 60; // Retorna el total de horas
}

function calcularTotal(dia) {
    var totalHoras = parseFloat(document.querySelector(`[name="totalHoras_${dia}"]`).value) || 0;
    var precioHora = parseFloat(document.querySelector(`[name="precioHora_${dia}"]`).value) || 0;
    var feriado = document.querySelector(`[name="feriado_${dia}"]`).checked;

    var total = totalHoras * precioHora;

    if (feriado) {
        total *= 2; // Ejemplo: duplicar el total si es feriado
    }

    document.querySelector(`[name="total_${dia}"]`).value = total.toFixed(2);
}

function guardar(dia, id) {
    var usuarioId = document.getElementById('usuario').value;
    var mes = document.getElementById('mes').value;
    var año = document.getElementById('año').value;
    var fecha = `${año}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    var entradaTM = document.querySelector(`[name="entradaTM_${dia}"]`).value;
    var salidaTM = document.querySelector(`[name="salidaTM_${dia}"]`).value;
    var entradaTT = document.querySelector(`[name="entradaTT_${dia}"]`).value;
    var salidaTT = document.querySelector(`[name="salidaTT_${dia}"]`).value;
    var feriado = document.querySelector(`[name="feriado_${dia}"]`).checked;
    var precioHora = parseFloat(document.querySelector(`[name="precioHora_${dia}"]`).value) || 0;

    var totalHoras = calcularHoras(entradaTM, salidaTM) + calcularHoras(entradaTT, salidaTT);
    var total = totalHoras * precioHora;
    if (feriado) {
        total *= 2;
    }

    fetch('/horas/guardar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            id: id !== null ? id : '', // Pasar el ID si existe
            usuarioId: usuarioId,
            fecha: fecha,
            entradaTM: entradaTM,
            salidaTM: salidaTM,
            entradaTT: entradaTT,
            salidaTT: salidaTT,
            feriado: feriado,
            precioHora: precioHora,
            totalHoras: totalHoras,
            total: total
        })
    })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert('Datos guardados correctamente.');
                } else {
                    alert('Error al guardar los datos.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al guardar los datos.');
            });
}

function cargarGastos() {
    console.log('ENTRANDO A CARGAR GASTOS');
    var usuarioId = document.getElementById('usuario').value;
    var mes = document.getElementById('mes').value;
    var año = document.getElementById('año').value;
    cargarGastosParaUsuario(usuarioId, mes, año);
}

function cargarGastosParaUsuario(usuarioId, mes, año) {
    console.log('ENTRANDO A CARGAR GASTOS PARA USUARIO');
    console.log('Cargando gastos para:', usuarioId, mes, año);
    var tablaGastos = document.getElementById('tablaGastos');
    tablaGastos.innerHTML = ''; // Limpiar tabla antes de cargar nuevos datos

    fetch(`/gastos/cargarGastos?usuarioId=${usuarioId}&mes=${mes}&año=${año}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                data.gastos.forEach(gasto => {
                    var fila = `
                    <tr>
                        <td>${gasto.fecha}</td>
                        <td>${gasto.cantidad}</td>
                        <td>${gasto.concepto}</td>
                        <td>
                            <button class="btn btn-primary" onclick="editarGasto(${gasto.id})">Editar</button>
                            <button class="btn btn-danger" onclick="eliminarGasto(${gasto.id})">Eliminar</button>
                        </td>
                    </tr>
                `;
                    tablaGastos.insertAdjacentHTML('beforeend', fila);
                });
            } else {
                alert('Error al cargar los gastos.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar los gastos.');
        });
}

function agregarGasto() {
    console.log('ENTRANDO A AGREGAR GASTO');
    var usuarioId = document.getElementById('usuario').value;
    var fechaGasto = document.getElementById('fechaGasto').value;
    var cantidadGasto = parseFloat(document.getElementById('cantidadGasto').value);
    var conceptoGasto = document.getElementById('conceptoGasto').value;

    if (!fechaGasto || isNaN(cantidadGasto) || !conceptoGasto) {
        alert('Por favor complete todos los campos del gasto.');
        return;
    }

    var gasto = {
        usuario: { id: usuarioId },
        fecha: fechaGasto,
        cantidad: cantidadGasto,
        concepto: conceptoGasto
    };

    fetch('/gastos/guardar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(gasto)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Gasto agregado correctamente.');
                cargarGastos();
            } else {
                alert('Error al agregar el gasto.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al agregar el gasto.');
        });
}
function editarGasto(id) {
    console.log('ENTRANDO A EDITAR GASTO');
    fetch(`/gastos/${id}`)
        .then(response => response.json())
        .then(gasto => {
            if (gasto) {
                document.getElementById('editarGastoId').value = gasto.id;
                document.getElementById('editarFechaGasto').value = gasto.fecha;
                document.getElementById('editarCantidadGasto').value = gasto.cantidad;
                document.getElementById('editarConceptoGasto').value = gasto.concepto;
                $('#editarGastoModal').modal('show');
            } else {
                alert('Gasto no encontrado.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar el gasto para editar.');
        });
}
function guardarGastoEditado() {
    var id = document.getElementById('editarGastoId').value;
    var fecha = document.getElementById('editarFechaGasto').value;
    var cantidad = parseFloat(document.getElementById('editarCantidadGasto').value);
    var concepto = document.getElementById('editarConceptoGasto').value;

    if (!fecha || isNaN(cantidad) || !concepto) {
        alert('Por favor complete todos los campos del gasto.');
        return;
    }

    var gasto = {
        id: id,
        fecha: fecha,
        cantidad: cantidad,
        concepto: concepto,
        usuario: { id: document.getElementById('usuario').value } // Asegúrate de incluir el usuario
    };

    fetch('/gastos/editar', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(gasto)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert('Gasto editado correctamente.');
            $('#editarGastoModal').modal('hide');
            cargarGastos(); // Llama a cargarGastos para actualizar la tabla
        } else {
            alert('Error al editar el gasto.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al editar el gasto.');
    });
}



function eliminarGasto(id) {
    console.log('ENTRANDO A ELIMINAR GASTO');
    fetch(`/gastos/eliminar?id=${id}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Gasto eliminado correctamente.');
                cargarGastos();
            } else {
                alert('Error al eliminar el gasto.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al eliminar el gasto.');
        });
}

