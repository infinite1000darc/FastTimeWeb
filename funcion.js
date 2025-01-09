const URL_OBTENER_ENVIO = 'http://localhost:8084/WSFastTime/ws/envio/obtenerEnvioNoGuia/';
const URL_OBTENER_PAQUETES = 'http://localhost:8084/WSFastTime/ws/paquete/obtenerPaqueteNoGuia/';
const URL_OBTENER_STATUS = 'http://localhost:8084/WSFastTime/ws/envio/obtenerEstatus/';

let cargandoDatos = false;
let ultimoNumeroGuia = "";

function validarNumeroCambio() {
    const inputNumero = document.getElementById("inputNoGuía");
    inputNumero.value = inputNumero.value.trim();
}

function validarCampos() {
    const inputNumero = document.getElementById("inputNoGuía");
    return inputNumero.value !== "";
}

function recargarSiCampoVacio() {
    const inputNumero = document.getElementById("inputNoGuía");
    if (inputNumero.value.trim() === "") {
        limpiarDatos();
    }
}

function obtenerInformacionEnvio() {
    if (validarCampos()) {
        cargarDatosEnvioYHistorial();
    } else {
        alert("Error: Número de guía no válido.");
    }
}

async function cargarDatosEnvioYHistorial() {
    const inputNumero = document.getElementById("inputNoGuía");
    const numeroGuia = inputNumero.value.trim();

    if (numeroGuia === ultimoNumeroGuia) {
        console.warn("El número de guía no ha cambiado. No se recargan los datos.");
        return;
    }
    ultimoNumeroGuia = numeroGuia;

    if (cargandoDatos) {
        console.warn("Ya se están cargando datos. Espera a que termine.");
        return;
    }

    cargandoDatos = true;

    const tablaEnvio = document.getElementById("tabla-envio")?.querySelector("tbody");
    const tablaHistorial = document.getElementById("tabla-historial")?.querySelector("tbody");

    if (!tablaEnvio || !tablaHistorial) {
        console.error("Error: Las tablas de envíos o historial no se encuentran en el DOM.");
        cargandoDatos = false;
        return;
    }

    if (!numeroGuia) {
        console.error("Error: El número de guía está vacío.");
        alert("Por favor, ingrese un número de guía válido.");
        cargandoDatos = false;
        return;
    }

    console.log("Número de guía ingresado:", numeroGuia);

    const peticionEnvio = URL_OBTENER_ENVIO + encodeURIComponent(numeroGuia);
    const peticionPaquetes = URL_OBTENER_PAQUETES + encodeURIComponent(numeroGuia);

    try {
        console.log("Realizando solicitudes a los servicios...");
        const [respuestaEnvio, respuestaPaquetes] = await Promise.all([
            fetch(peticionEnvio, { method: 'GET' }),
            fetch(peticionPaquetes, { method: 'GET' })
        ]);

        console.log("Respuesta del servicio de envío:", respuestaEnvio);
        console.log("Respuesta del servicio de paquetes:", respuestaPaquetes);

        if (!respuestaEnvio.ok || !respuestaPaquetes.ok) {
            throw new Error("Error al obtener los datos del envío o paquetes.");
        }

        const envioArray = await respuestaEnvio.json();
        console.log("Datos del envío recibidos:", envioArray);

        const paquetes = await respuestaPaquetes.json();
        console.log("Datos de los paquetes recibidos:", paquetes);

        if (!envioArray || envioArray.length === 0) {
            console.warn("No se encontró información de envío.");
            tablaEnvio.innerHTML = "<tr><td colspan='8'>No se encontró información de envío.</td></tr>";
            cargandoDatos = false;
            return;
        }

        const envio = envioArray[0];
        mostrarDatosEnvio(tablaEnvio, envio, paquetes);

        const peticionHistorial = URL_OBTENER_STATUS + encodeURIComponent(envio.idEnvio);
        console.log("Realizando solicitud al servicio de historial:", peticionHistorial);

        const respuestaHistorial = await fetch(peticionHistorial, { method: 'GET' });
        console.log("Respuesta del servicio de historial:", respuestaHistorial);

        if (!respuestaHistorial.ok) {
            throw new Error("No se pudo obtener el historial del envío.");
        }

        const historial = await respuestaHistorial.json();
        console.log("Datos del historial recibidos:", historial);

        if (!historial || historial.length === 0) {
            console.warn("No se encontró historial para este envío.");
            tablaHistorial.innerHTML = "<tr><td colspan='3'>No se encontró historial para este envío.</td></tr>";
            cargandoDatos = false;
            return;
        }

        mostrarHistorialEnvio(tablaHistorial, historial);
    } catch (error) {
        console.error("Error al cargar los datos:", error);
        tablaEnvio.innerHTML = "<tr><td colspan='8'>Hubo un error al cargar los datos. Intente nuevamente.</td></tr>";
        tablaHistorial.innerHTML = "<tr><td colspan='3'>Hubo un error al cargar el historial. Intente nuevamente.</td></tr>";
    } finally {
        cargandoDatos = false;
    }
}

function mostrarDatosEnvio(tablaEnvio, envio, paquetes) {
    console.log("Mostrando datos del envío:", envio);
    console.log("Mostrando datos de los paquetes:", paquetes);

    const filasExistentes = new Set(
        Array.from(tablaEnvio.rows).map(row => row.innerHTML.trim())
    );

    paquetes.forEach(paquete => {
        const nuevaFilaHTML = `
            <td>${envio.origen || "N/A"}</td>
            <td>${envio.destino || "N/A"}</td>
            <td>${envio.conductor || "N/A"}</td>
            <td>${paquete.descripcionPaquete || "N/A"}</td>
            <td>${paquete.alto || "N/A"}</td>
            <td>${paquete.ancho || "N/A"}</td>
            <td>${paquete.profundidad || "N/A"}</td>
            <td>${paquete.peso || "N/A"}</td>
        `;

        if (!filasExistentes.has(nuevaFilaHTML)) {
            const nuevaFila = document.createElement("tr");
            nuevaFila.innerHTML = nuevaFilaHTML;
            tablaEnvio.appendChild(nuevaFila);
            filasExistentes.add(nuevaFilaHTML);
        }
    });
}

function mostrarHistorialEnvio(tablaHistorial, historial) {
    console.log("Mostrando historial del envío:", historial);

    const filasExistentes = new Set(
        Array.from(tablaHistorial.rows).map(row => row.innerHTML.trim())
    );

    historial.forEach(estatus => {
        const nuevaFilaHTML = `
            <td>${estatus.modificacion || "N/A"}</td>
            <td>${estatus.status || "N/A"}</td>
        `;

        if (!filasExistentes.has(nuevaFilaHTML)) {
            const nuevaFila = document.createElement("tr");
            nuevaFila.innerHTML = nuevaFilaHTML;
            tablaHistorial.appendChild(nuevaFila);
            filasExistentes.add(nuevaFilaHTML);
        }
    });
}

function limpiarDatos() {
    const tablaEnvio = document.getElementById("tabla-envio")?.querySelector("tbody");
    const tablaHistorial = document.getElementById("tabla-historial")?.querySelector("tbody");

    if (tablaEnvio) tablaEnvio.innerHTML = "";
    if (tablaHistorial) tablaHistorial.innerHTML = "";
    ultimoNumeroGuia = "";
    cargandoDatos = false;
    console.log("Datos limpiados y estado restablecido.");
}

