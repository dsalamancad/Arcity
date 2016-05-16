var horaInicio;
var alerta_manzana;

var alerta_diaInicial,alerta_mesInicial,alerta_anoInicial,alerta_diaFinal,alerta_mesFinal,alerta_anoFinal;

var alerta_policiaReportados, alerta_arbolesReportados, alerta_canecaReportados, alerta_estacionReportados, alerta_juegoReportados, alerta_sillaReportados, alerta_luzReportados;

var alerta_policiaPonderados, alerta_arbolesPonderados, alerta_basurasPonderados, alerta_accesoPonderados, alerta_juegoPonderados, alerta_sillasPonderados, alerta_luzPonderados;

var alerta_hoy=new Date();

    //Function To Display Popup
 function crearFormulario(){
     console.log(horaInicio);
        document.getElementById("divCentrado").innerHTML = "<div id='estadoVisualizacion'><h2>Estado de la visualización</h2><div id='fechayManzana'><p id='fecha'>Rango de Fecha:<br><span>Del "+alerta_diaInicial+"/"+alerta_mesInicial+"/"+alerta_anoInicial+" al "+alerta_diaFinal+"/"+alerta_mesFinal+"/"+alerta_anoFinal+"</span></p><p id='manzana'>Manzana Seleccionada:<span>"+alerta_manzana+"</span></p></div><div id='reportesEnlaManzana'><p id='reportesEnZona'>Reportes en la manzana seleccionada:</p><div><img src='imagenes/iconos/iconoPolicia.png' alt=''><span>"+alerta_policiaReportados+"</span></div><div><img src='imagenes/iconos/iconoArbol.png' alt=''><span>"+alerta_arbolesReportados+"</span></div><div><img src='imagenes/iconos/iconoCaneca.png' alt=''><span>"+alerta_canecaReportados+"</span></div><div><img src='imagenes/iconos/iconoEstacion.png' alt=''><span>"+alerta_estacionReportados+"</span></div><div><img src='imagenes/iconos/iconoJuego.png' alt=''><span>"+alerta_juegoReportados+"</span></div><div><img src='imagenes/iconos/iconoSilla.png' alt=''><span>"+alerta_sillaReportados+"</span></div><div><img src='imagenes/iconos/iconoLuz.png' alt=''><span>"+alerta_luzReportados+"</span></div></div><div id='ponderacionSelecccionada'><p>Peso ponderado seleccionado</p><table><tr><td>Policías:</td><td><span>"+alerta_policiaPonderados+"</span></td></tr><tr><td>Árboles:</td><td><span>"+alerta_arbolesPonderados+"</span></td></tr><tr><td>Basuras:</td><td><span>"+alerta_basurasPonderados+"</span></td></tr><tr><td>Acceso:</td><td><span>"+alerta_accesoPonderados+"</span></td></tr><tr><td>Juegos:</td><td><span>"+alerta_juegoPonderados+"</span></td></tr><tr><td>Sillas:</td><td><span>"+alerta_sillasPonderados+"</span></td></tr><tr><td>Luz:</td><td><span>"+alerta_luzPonderados+"</span></td></tr></table></div></div><div id='datosEnvio'><h2>Creación de alerta</h2><form action='#' id='form' method='post' name='form'><img id='close' src='imagenes/cerrar.png' onclick='esconderFormulario()'><div id='responsablesAEnviar'><h3>A los responsables de cuales categorías quiere enviar?</h3><div><input type='checkbox' name='CategoriasAEnviar' value='Policias' id='CategoriasAEnviar_0'><img src='imagenes/iconos/iconoPolicia.png'></div><div><input type='checkbox' name='CategoriasAEnviar' value='arboles' id='CategoriasAEnviar_1'><img src='imagenes/iconos/iconoArbol.png'></div><div><input type='checkbox' name='CategoriasAEnviar' value='basuras' id='CategoriasAEnviar_2'><img src='imagenes/iconos/iconoCaneca.png'></div><div><input type='checkbox' name='CategoriasAEnviar' value='estacion' id='CategoriasAEnviar_3'><img src='imagenes/iconos/iconoEstacion.png'></div><div><input type='checkbox' name='CategoriasAEnviar' value='juegos' id='CategoriasAEnviar_3'><img src='imagenes/iconos/iconoJuego.png'></div><div><input type='checkbox' name='CategoriasAEnviar' value='sillas' id='CategoriasAEnviar_4'><img src='imagenes/iconos/iconoSilla.png'></div><div><input type='checkbox' name='CategoriasAEnviar' value='luz' id='CategoriasAEnviar_5'><img src='imagenes/iconos/iconoLuz.png'></div></div><div id='escrito'><h3>Mensaje:</h3><textarea name='mensajeAResponsables' rows='8' id='mensajeAResponsables' placeholder='Escriba su mensaje acá'></textarea></div><div id='usuarioyHoy'><h3>Alerta creada por:</h3><p id='usuario'>Usuario:<span>Daniel Salamanca</span></p><p id='fechaHoy'>Fecha de hoy:<span>"+alerta_hoy.getDate()+"/"+alerta_hoy.getMonth()+"/"+alerta_hoy.getFullYear()+"</span></p></div><a id='submit'>enviar</a></form></div>";
         mostrarFormulario();
    }

function mostrarFormulario() {
document.getElementById('fondoOscuro').style.display = "block";
}
//Function to Hide Popup
function esconderFormulario(){
document.getElementById('fondoOscuro').style.display = "none";
}
