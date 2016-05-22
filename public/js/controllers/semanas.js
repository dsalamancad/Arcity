
var datosCuadradosPolicias = crearCuadrados(540);
var opacidadesGuardadasPolicias = [];
var opacidadesCuadrosPolicias = {};

var datosCuadradosArboles = crearCuadrados(540);
var opacidadesGuardadasArboles = [];
var opacidadesCuadrosArboles = {};

var datosCuadradosBasuras = crearCuadrados(540);
var opacidadesGuardadasBasuras = [];
var opacidadesCuadrosBasuras = {};

var datosCuadradosAccesos = crearCuadrados(540);
var opacidadesGuardadasAccesos = [];
var opacidadesCuadrosAccesos = {};

var datosCuadradosJuegos = crearCuadrados(540);
var opacidadesGuardadasJuegos = [];
var opacidadesCuadrosJuegos = {};

var datosCuadradosSillas = crearCuadrados(540);
var opacidadesGuardadasSillas = [];
var opacidadesCuadrosSillas = {};

var datosCuadradosLuces = crearCuadrados(540);
var opacidadesGuardadasLuces = [];
var opacidadesCuadrosLuces = {};



//VARIALBLES PARA GUARDAR OPACIDADES TRAIDAS DE LA DB





function crearCuadradosSemanas(id, width, height, colorEscogido, categoria, arregloCondatos) {



    // console.log(arregloCondatos);
    var grid = d3.select(id).append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", categoria);

    //    var row = grid.selectAll(".row")
    //                  .data(datosCuadrados)
    //                .enter().append("svg:g")
    //                  .attr("class", "row");

    var celda = grid.selectAll(".cell")
        .data(arregloCondatos)
        .enter().append("svg:rect")
        .attr("class", function (d) {
            return categoria + d.count;
        })
        .attr("x", function (d) {
            return d.x;
        })
        .attr("y", function (d) {
            return d.y;
        })
        .attr("fill-opacity", function (d) {
            return d.opacidad;
        })
        //.attr("fill-opacity","0.3")
        .attr("width", function (d) {
            return d.width;
        })
        .attr("height", function (d) {
            return d.height;
        })
        .on('mouseover', function () {
            d3.select(this)
                .style('fill', '#0F0')

        })
        .on('mouseout', function () {
            d3.select(this)
                .style('fill', String(colorEscogido))

        })
        .on('click', function () {
            console.log(d3.select(this));
        })
        .style("fill", String(colorEscogido))
        .style("stroke", '#ddd');



}

function crearCuadrados(gridWidth) {
    var data = new Array();
    var gridItemWidth = gridWidth / 52;
    var gridItemHeight = gridItemWidth;
    var startX = gridItemWidth / 2;
    var startY = gridItemHeight / 2;
    var stepX = gridItemWidth;
    var stepY = gridItemHeight;
    var xpos = startX;
    var ypos = startY;
    var newValue = 0;
    var count = 0;

    for (var index_b = 0; index_b < 52; index_b++) {
        newValue = Math.round(Math.random() * (100 - 1) + 1);
        data.push({

            width: gridItemWidth,
            height: gridItemHeight,
            x: xpos,
            y: ypos,
            count: count,
            opacidad: 0.3
        });
        xpos += stepX;
        count += 1;
    }
    xpos = startX;
    ypos += stepY;
    //definiropacidad();
    return data;
}


function definirOpacidad(objetosConDatos, objetoQuellegaConValores, opacidadesGuardas) {
    //console.log("llamado 7");
    for (each in objetosConDatos) {

        var l = objetosConDatos[each];
        var conteo = l.count;
       var opacidadAsignada = objetoQuellegaConValores[Number(conteo)];
        if(opacidadAsignada==undefined){
            opacidadAsignada = 0.05;
        }
        
        opacidadesGuardas.push(opacidadAsignada);
        l.opacidad = opacidadesGuardas[each];
    }
   
}

