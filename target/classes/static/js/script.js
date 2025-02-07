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

    // Configurar la fecha del día actual en el campo de fecha de adelantos
    var fechaAdelantoInput = document.getElementById('fechaAdelanto');
    if (fechaAdelantoInput) {
        var today = new Date();
        var day = String(today.getDate()).padStart(2, '0');
        var month = String(today.getMonth() + 1).padStart(2, '0'); // Enero es 0
        var year = today.getFullYear();
        var todayString = year + '-' + month + '-' + day;
        fechaAdelantoInput.value = todayString;
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
}


function cargarDias() {
    console.log('ENTRANDO A CARGAR DIAS');
    var usuarioId = document.getElementById('usuario').value;
    var mes = document.getElementById('mes').value;
    var año = document.getElementById('año').value;
    cargarDiasParaUsuario(usuarioId, mes, año);
    cargarGastosParaUsuario(usuarioId, mes, año); // Llama a cargarGastosParaUsuario para cargar los gastos del mes y año seleccionados
    cargarAdelantosParaUsuario(usuarioId, mes, año); // Llama a cargarAdelantosParaUsuario para cargar los adelantos del mes y año seleccionados
    obtenerTotales();
}


function cargarDiasParaUsuario(usuarioId, mes, año) {
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
    var precioHoraInput = document.querySelector(`[name="precioHora_${dia}"]`);
    var precioHora = parseFloat(precioHoraInput.value);

    // Validar que el campo precioHora no esté vacío o sea NaN
    if (!precioHoraInput.value || isNaN(precioHora)) {
        alert('Por favor, ingrese un valor válido para el precio por hora.');
        return;
    }

    var totalHoras = calcularHoras(entradaTM, salidaTM) + calcularHoras(entradaTT, salidaTT);
    var total = totalHoras * precioHora;
    if (feriado) {
        total *= 2;
    }

    // Obtén el token CSRF y el encabezado del HTML
    const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute("content");
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");

    fetch('/horas/guardar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            [csrfHeader]: csrfToken // Agregar token CSRF
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
                    obtenerTotales(); // Actualizar los totales
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
    console.log('Cargando gastos para:', usuarioId, mes, año);
    var tablaGastos = document.getElementById('tablaGastos');
    tablaGastos.innerHTML = ''; // Limpiar tabla antes de cargar nuevos datos

    fetch(`/gastos/cargarGastos?usuarioId=${usuarioId}&mes=${mes}&año=${año}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    data.gastos.forEach(gasto => {
                        var fechaGasto = new Date(gasto.fecha);
                        if (fechaGasto.getMonth() + 1 === parseInt(mes) && fechaGasto.getFullYear() === parseInt(año)) {
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
                        }
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
        usuario: {id: usuarioId},
        fecha: fechaGasto,
        cantidad: cantidadGasto,
        concepto: conceptoGasto
    };

    // Obtén el token CSRF y el encabezado del HTML
    const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute("content");
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");

    fetch('/gastos/guardar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken // Incluye el token CSRF
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
                    obtenerTotales();
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
    const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute("content");
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");

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
        usuario: {id: document.getElementById('usuario').value}
    };

    fetch('/gastos/editar', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
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
                    cargarGastos();
                    obtenerTotales();
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

    const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute("content");
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");

    fetch(`/gastos/eliminar?id=${id}`, {
        method: 'DELETE',
        headers: {
            [csrfHeader]: csrfToken
        }
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
                    obtenerTotales();
                } else {
                    alert('Error al eliminar el gasto.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al eliminar el gasto.');
            });
}


function agregarAdelanto() {
    console.log('ENTRANDO A AGREGAR ADELANTO');

    var usuarioId = document.getElementById('usuario').value;
    var fechaAdelanto = document.getElementById('fechaAdelanto').value;
    var cantidadAdelanto = parseFloat(document.getElementById('cantidadAdelanto').value);

    if (!fechaAdelanto || isNaN(cantidadAdelanto)) {
        alert('Por favor complete todos los campos del adelanto.');
        return;
    }

    var adelanto = {
        usuario: {id: usuarioId},
        fecha: fechaAdelanto,
        cantidad: cantidadAdelanto
    };

    // Obtén el token CSRF y el encabezado desde las metaetiquetas
    const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute("content");
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");

    fetch('/adelantos/guardar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken // Agrega el token CSRF en el encabezado
        },
        body: JSON.stringify(adelanto)
    })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert('Adelanto agregado correctamente.');
                    cargarAdelantos();
                    obtenerTotales();
                } else {
                    alert('Error al agregar el adelanto.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al agregar el adelanto.');
            });
}





function cargarAdelantos() {
    console.log('ENTRANDO A CARGAR ADELANTOS');
    var usuarioId = document.getElementById('usuario').value;
    var mes = document.getElementById('mes').value;
    var año = document.getElementById('año').value;
    cargarAdelantosParaUsuario(usuarioId, mes, año);
}



function cargarAdelantosParaUsuario(usuarioId, mes, año) {
    console.log('Cargando adelantos para:', usuarioId, mes, año);
    var tablaAdelantos = document.getElementById('tablaAdelantos');
    tablaAdelantos.innerHTML = ''; // Limpiar tabla antes de cargar nuevos datos

    fetch(`/adelantos/cargarAdelantos?usuarioId=${usuarioId}&mes=${mes}&año=${año}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    data.adelantos.forEach(adelanto => {
                        var fechaAdelanto = new Date(adelanto.fecha);
                        if (fechaAdelanto.getMonth() + 1 === parseInt(mes) && fechaAdelanto.getFullYear() === parseInt(año)) {
                            var fila = `
                        <tr>
                            <td>${adelanto.fecha}</td>
                            <td>${adelanto.cantidad}</td>
                            <td>
                                <button class="btn btn-primary" onclick="editarAdelanto(${adelanto.id})">Editar</button>
                                <button class="btn btn-danger" onclick="eliminarAdelanto(${adelanto.id})">Eliminar</button>
                            </td>
                        </tr>
                    `;
                            tablaAdelantos.insertAdjacentHTML('beforeend', fila);
                        }
                    });
                } else {
                    alert('Error al cargar los adelantos.');
                }

            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al cargar los adelantos.');
            });
}

function editarAdelanto(id) {
    console.log('ENTRANDO A EDITAR ADELANTO');
    fetch(`/adelantos/${id}`)
            .then(response => response.json())
            .then(adelanto => {
                if (adelanto) {
                    document.getElementById('editarAdelantoId').value = adelanto.id;
                    document.getElementById('editarFechaAdelanto').value = adelanto.fecha;
                    document.getElementById('editarCantidadAdelanto').value = adelanto.cantidad;
                    $('#editarAdelantoModal').modal('show');
                } else {
                    alert('Adelanto no encontrado.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al cargar el adelanto para editar.');
            });
}

function guardarAdelantoEditado() {
    const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute("content");
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");

    var id = document.getElementById('editarAdelantoId').value;
    var fecha = document.getElementById('editarFechaAdelanto').value;
    var cantidad = parseFloat(document.getElementById('editarCantidadAdelanto').value);

    if (!fecha || isNaN(cantidad)) {
        alert('Por favor complete todos los campos del adelanto.');
        return;
    }

    var adelanto = {
        id: id,
        fecha: fecha,
        cantidad: cantidad,
        usuario: {id: document.getElementById('usuario').value}
    };

    fetch('/adelantos/editar', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            [csrfHeader]: csrfToken
        },
        body: JSON.stringify(adelanto)
    })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert('Adelanto editado correctamente.');
                    $('#editarAdelantoModal').modal('hide');
                    cargarAdelantos();
                    obtenerTotales();
                } else {
                    alert('Error al editar el adelanto.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al editar el adelanto.');
            });
}
function eliminarAdelanto(id) {
    console.log('ENTRANDO A ELIMINAR ADELANTO');

    const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute("content");
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");

    fetch(`/adelantos/eliminar/${id}`, {
        method: 'DELETE',
        headers: {
            [csrfHeader]: csrfToken
        }
    })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert('Adelanto eliminado correctamente.');
                    cargarAdelantos();
                    obtenerTotales();
                } else {
                    alert('Error al eliminar el adelanto.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al eliminar el adelanto.');
            });
}


function obtenerTotales() {
    var usuarioId = document.getElementById('usuario').value;
    var mes = document.getElementById('mes').value;
    var año = document.getElementById('año').value;

    fetch(`/adelantos/totales?usuarioId=${usuarioId}&mes=${mes}&año=${año}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('totalGanado').value = data.totalGanado.toFixed(2);
                    document.getElementById('totalGastos').value = data.totalGastos.toFixed(2);
                    document.getElementById('totalAdelantos').value = data.totalAdelantos.toFixed(2);
                    document.getElementById('totalNeto').value = data.totalNeto.toFixed(2);
                } else {
                    alert('Error al obtener los totales.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al obtener los totales.');
            });
}

function guardarNuevoUsuario() {
    var nombre = document.getElementById('nombreUsuario').value;

    if (!nombre) {
        alert('Por favor complete todos los campos.');
        return;
    }

    var usuario = {
        nombre: nombre
    };

    fetch('/usuarios/crear', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuario)
    })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    alert('Usuario agregado correctamente.');
                    $('#nuevoUsuarioModal').modal('hide');
                    location.reload(); // Recargar la página para reflejar los cambios
                } else {
                    alert('Error al agregar el usuario.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al agregar el usuario.');
            });
}


document.addEventListener('DOMContentLoaded', function () {
    cargarUsuariosEliminar();
});

function cargarUsuariosEliminar() {
    fetch('/usuarios/listar')
            .then(response => response.json())
            .then(data => {
                if (data) {
                    var select = document.getElementById('usuarioEliminar');
                    select.innerHTML = '';
                    data.forEach(usuario => {
                        var option = document.createElement('option');
                        option.value = usuario.id;
                        option.textContent = usuario.nombre;
                        select.appendChild(option);
                    });
                } else {
                    alert('Error al cargar los usuarios.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error al cargar los usuarios.');
            });
}

function eliminarUsuario() {
    var usuarioId = document.getElementById('usuarioEliminar').value;

    if (!usuarioId) {
        alert('Por favor, seleccione un usuario.');
        return;
    }

    // Mostrar el cuadro de confirmación antes de eliminar
    var confirmarEliminacion = confirm("¿Está seguro que desea eliminar este usuario?");

    if (!confirmarEliminacion) {
        return; // Si el usuario cancela, no hacer nada
    }

    // Obtener el token CSRF de las meta tags
    const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute("content");
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");

    fetch(`/usuarios/eliminar/${usuarioId}`, {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json",
            [csrfHeader]: csrfToken // Incluir el token CSRF en los encabezados
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert('Usuario eliminado correctamente.');
            $('#eliminarUsuarioModal').modal('hide');
            location.reload(); // Recargar la página para reflejar los cambios
        } else {
            alert('Error al eliminar el usuario.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al eliminar el usuario.');
    });
}



document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("usuarioForm");

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();  // Evitar el comportamiento por defecto del formulario

            // Obtener los valores del formulario
            const nombre = document.getElementById("nombre").value;
            // Obtener el token CSRF de las meta tags
            const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute("content");
            const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");

            fetch("http://localhost:8080/usuarios/crear", {
                method: "POST",
                body: JSON.stringify({nombre: nombre}),
                headers: {
                    "Content-Type": "application/json",
                    [csrfHeader]: csrfToken // Incluir el token CSRF en los encabezados
                }
            })
            .then(response => {
                if (!response.ok) {  // Verificar si la respuesta es exitosa (código de estado 2xx)
                    return Promise.reject('Error en la solicitud');
                }
                return response.json();  // Convertir la respuesta a JSON si es exitosa
            })
            .then(data => {
                const messageContainer = document.getElementById("message");

                // Mostrar el cartel de mensaje fuera del modal
                if (data.success) {
                    messageContainer.innerHTML =
                            `<div class="alert alert-success" role="alert">Usuario creado con éxito: ${data.usuario.nombre}</div>`;
                    
                    // Mostrar un mensaje de éxito en un alert
                    alert(`Usuario creado con éxito: ${data.usuario.nombre}`);
                } else {
                    messageContainer.innerHTML =
                            `<div class="alert alert-danger" role="alert">Error al crear usuario.</div>`;
                }

                // Hacer visible el mensaje
                messageContainer.style.display = 'block';

                // Cerrar el modal
                $('#crearUsuarioModal').modal('hide');

                // Refrescar la página
                location.reload();  // Esto recargará la página actual
            })
            .catch(error => {
                // Manejar errores de la solicitud o problemas con la respuesta
                document.getElementById("message").innerHTML =
                        `<div class="alert alert-danger" role="alert">Error en la solicitud: ${error}</div>`;
            });
        });
    }
});



// Llamar a la función cuando se envíe el formulario
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("usuarioForm");
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();  // Evitar el comportamiento por defecto del formulario

            // Llamar a la función para crear el usuario
            crearUsuario();
        });
    }
});
