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
        alert("Buscando información");
    }else{
        alert("Error: Número de guía no valido.")
    }
}