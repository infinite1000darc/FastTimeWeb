const URL_OBTENERESTADOS = "http://localhost:8080/WSFastTime/ws/"

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