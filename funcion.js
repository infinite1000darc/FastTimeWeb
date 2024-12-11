const URL_OBTENERESTADOS = "http://localhost:8080/WSFastTime/ws/"

function validarNumeroCambio(){
    const inputNumero = document.getElementById("inputNoGuía");
    if((inputNumero.value < 0) || (inputNumero.value == "")){
        inputNumero.value = 0;
    }
}