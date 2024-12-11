const URL_OBTENER_ENVIO = "http://localhost:8080/WSFastTime/ws/"
const URL_OBTENER_ESTADOS = "http://localhost:8080/WSFastTime/ws/"
const URL_OBTENER_PAQUETES = "http://localhost:8080/WSFastTime/ws/paquete/obtenerPaqueteEnvio/"

function validarNumeroCambio(){
    const inputNumero = document.getElementById("inputNoGuía");
    if((inputNumero.value < 0) || (inputNumero.value == "")){
        inputNumero.value = 0;
    }
}

function validarCampos(){
    const inputNumero = document.getElementById("inputNoGuía");
    let camposValidos = true;
    if((inputNumero.value < 0) || (inputNumero.value == "")){
        camposValidos = false;
    }
    return camposValidos;
}

function obtenerInformaciónEnvio(){
    if(validarCampos()){
        obtenerInformacionPaquetes();
    }else{
        alert("Error: Número de guía no valido.")
    }
}

function mostrarPaquetes(listaPaquetes, paquetes){
    listaPaquetes.innerHTML = "";
    paquetes.forEach(paquete => {
        const paqueteElemento = document.createElement('div');
        paqueteElemento.className = "lista-elementos";
        paqueteElemento.innerHTML = `
            <strong> Descripcion: <strong> ${paquete.descripcionPaquete} <br>
            <strong> Alto: <strong> ${paquete.alto} <br>
            <strong> Ancho: <strong> ${paquete.ancho} <br>
            <strong> Profundidad: <strong> ${paquete.profundidad} <br>
            <strong> Peso: <strong> ${paquete.peso} <br>
        `;
        listaPaquetes.appendChild(paqueteElemento);
    });
}

async function obtenerInformacionPaquetes(){
    const listaPaquetes = document.getElementById("lista-paquetes");
    const inputNumero = document.getElementById("inputNoGuía");

    listaPaquetes.innerHTML = "<p>Cargando información de paquetes...</p>";

    const noGuía = inputNumero.value;

    const peticion = URL_OBTENER_PAQUETES+noGuía;

    //Inicia consumo
    try{
        const respuesta = await fetch(peticion, {
            method: 'GET'
        });

        if(respuesta.ok){
            const paquetes = await respuesta.json();
            console.log(paquetes);
            mostrarPaquetes(listaPaquetes,paquetes);
        }else{
            //No es ni acento ni comilla simple, es ` y se activa con alt gr en el }
            throw new Error(`Error en la petición: ${respuesta.status}`);
        }
    }catch(error){
        console.error("Error en la peticion", error);
        listaPaquetes.innerHTML = "<p>Hubo un error en la conexión. Intente después.</p>"
    }
}