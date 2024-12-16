const URL_OBTENER_ENVIO = 'http://localhost:8084/WSFastTime/ws/envio/obtenerEnvioNoGuia/';
const URL_OBTENER_PAQUETES = 'http://localhost:8084/WSFastTime/ws/paquete/obtenerPaqueteNoGuia/';
const URL_OBTENER_STATUS = 'http://localhost:8084/WSFastTime/ws/envio/obtenerEstatus/';

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
        // Si el campo está vacío, recarga la página
        location.reload();
    }
}

function obtenerInformacionEnvio() {
    if (validarCampos()) {
        cargarDatosEnvio();
    } else {
        alert("Error: Número de guía no válido.");
    }
}

async function cargarDatosEnvio() {
    const tablaEnvio = document.getElementById("tabla-envio")?.querySelector("tbody");
    if (!tablaEnvio) {
        console.error("Error: La tabla de envíos no se encuentra en el DOM.");
        return;
    }

    const inputNumero = document.getElementById("inputNoGuía");
    const numeroGuia = inputNumero.value.trim();

    if (!numeroGuia) {
        console.error("Error: El número de guía está vacío.");
        alert("Por favor, ingrese un número de guía válido.");
        return;
    }

    console.log("Número de guía ingresado:", numeroGuia);

    // Limpia la tabla antes de cargar nuevos datos
    tablaEnvio.innerHTML = "<tr><td colspan='8'>Cargando información...</td></tr>";

    const peticionEnvio = URL_OBTENER_ENVIO + encodeURIComponent(numeroGuia);
    const peticionPaquetes = URL_OBTENER_PAQUETES + encodeURIComponent(numeroGuia);

    console.log("URL de la petición de envío:", peticionEnvio);
    console.log("URL de la petición de paquetes:", peticionPaquetes);

    try {
        const [respuestaEnvio, respuestaPaquetes] = await Promise.all([
            fetch(peticionEnvio, { method: 'GET' }),
            fetch(peticionPaquetes, { method: 'GET' })
        ]);

        if (!respuestaEnvio.ok) {
            console.error("Error al obtener envío:", respuestaEnvio.status);
            throw new Error("No se pudo obtener la información del envío.");
        }

        if (!respuestaPaquetes.ok) {
            console.error("Error al obtener paquetes:", respuestaPaquetes.status);
            throw new Error("No se pudo obtener la información de los paquetes.");
        }

        const envioArray = await respuestaEnvio.json();
        const paquetes = await respuestaPaquetes.json();

        if (!envioArray || envioArray.length === 0) {
            console.error("Error: No se encontró información de envío.");
            tablaEnvio.innerHTML = "<tr><td colspan='8'>No se encontró información de envío.</td></tr>";
            return;
        }

        const envio = envioArray[0]; // Toma el primer elemento del array
        console.log("Datos de envío recibidos (primero del array):", envio);

        // Elimina duplicados en paquetes si es necesario
        const paquetesUnicos = paquetes.filter((paquete, index, self) =>
            index === self.findIndex((p) => (
                p.descripcionPaquete === paquete.descripcionPaquete && p.numeroGuia === paquete.numeroGuia
            ))
        );
        console.log("Datos de paquetes recibidos:", paquetesUnicos);

        mostrarDatosEnvio(tablaEnvio, envio, paquetesUnicos);
    } catch (error) {
        console.error("Error al cargar los datos:", error);
        tablaEnvio.innerHTML = "<tr><td colspan='8'>Hubo un error al cargar los datos. Intente nuevamente.</td></tr>";
    }
}

function mostrarDatosEnvio(tablaEnvio, envio, paquetes) {
    // Limpia la tabla antes de agregar datos
    tablaEnvio.innerHTML = "";

    console.log("Contenido de envio recibido en mostrarDatosEnvio:", envio);

    paquetes.forEach(paquete => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${envio.origen || "N/A"}</td>
            <td>${envio.destino || "N/A"}</td>
            <td>${paquete.status || envio.status || "N/A"}</td>
            <td>${paquete.descripcionPaquete || "N/A"}</td>
            <td>${paquete.alto || "N/A"}</td>
            <td>${paquete.ancho || "N/A"}</td>
            <td>${paquete.profundidad || "N/A"}</td>
            <td>${paquete.peso || "N/A"}</td>
        `;
        tablaEnvio.appendChild(fila);
    });

    const filaHistorial = document.createElement("tr");
    filaHistorial.innerHTML = `
        <td colspan="8" style="text-align: center;">
            <button onclick="verHistorial(${envio.idEnvio})">Ver Historial</button>
        </td>
    `;
    tablaEnvio.appendChild(filaHistorial);
}



async function cargarHistorialEnvio(idEnvio) {
    const tablaHistorial = document.getElementById("tabla-historial")?.querySelector("tbody");
    if (!tablaHistorial) {
        console.error("Error: La tabla de historial no se encuentra en el DOM.");
        return;
    }

    tablaHistorial.innerHTML = "<tr><td colspan='3'>Cargando historial...</td></tr>";

    try {
        const respuesta = await fetch(URL_OBTENER_STATUS + encodeURIComponent(idEnvio), { method: 'GET' });

        if (!respuesta.ok) {
            throw new Error("No se pudo obtener el historial del envío.");
        }

        const historial = await respuesta.json();

        if (!historial || historial.length === 0) {
            tablaHistorial.innerHTML = "<tr><td colspan='3'>No se encontró historial para este envío.</td></tr>";
            return;
        }

        mostrarHistorialEnvio(tablaHistorial, historial);
    } catch (error) {
        console.error("Error al cargar el historial:", error);
        tablaHistorial.innerHTML = "<tr><td colspan='3'>Hubo un error al cargar el historial. Intente nuevamente.</td></tr>";
    }
}

function mostrarHistorialEnvio(tablaHistorial, historial) {
    tablaHistorial.innerHTML = "";

    historial.forEach(estatus => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${estatus.status || "N/A"}</td>
        `;
        tablaHistorial.appendChild(fila);
    });
}

function verHistorial(idEnvio) {
    if (!idEnvio) {
        alert("El ID de envío no está disponible.");
        return;
    }
    cargarHistorialEnvio(idEnvio);
}
