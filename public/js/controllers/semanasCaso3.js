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
                .style('fill', '#0F0');


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

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);






    d3.select(".policias23").style("stroke", '#444').attr("height", "15").attr("y", "3").attr("width", "9").on("mouseover", function () {
            
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("La policia Nacional destinó personal fijo durante el día y la noche con el fin de cuidar a la ciudadanía y la maquinaria de la obra")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
    d3.select(".accesos2").style("stroke", '#444').attr("height", "15").attr("y", "3").attr("width", "9").on("mouseover", function () {
            //d3.select(".policias0").attr("transform", "translate(0,2)");
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Inicio de obras por parte del IDU para la intervención de andenes, mejora de superficies y vías de acceso")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
     d3.select(".accesos27").style("stroke", '#444').attr("height", "15").attr("y", "3").attr("width", "9").on("mouseover", function () {
            //d3.select(".policias0").attr("transform", "translate(0,2)");
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Entrega de la obra a la comunidad")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    d3.select(".luces6").style("stroke", '#444').attr("height", "15").attr("y", "3").attr("width", "9").on("mouseover", function () {
            //d3.select(".policias0").attr("transform", "translate(0,2)");
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Inicio de intervención por parte de la EEB. Se cambiarán postes, cables aéreos y tipo de bombillo")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
      d3.select(".luces20").style("stroke", '#444').attr("height", "15").attr("y", "3").attr("width", "9").on("mouseover", function () {
            //d3.select(".policias0").attr("transform", "translate(0,2)");
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Entrega de obra a la comunidad")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    d3.select(".basuras35").style("stroke", '#444').attr("height", "15").attr("y", "3").attr("width", "9").on("mouseover", function () {
            //d3.select(".policias0").attr("transform", "translate(0,2)");
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Se finaliza instalación de canecas alrededor de toda la zona")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    d3.select(".juegos39").style("stroke", '#444').attr("height", "15").attr("y", "3").attr("width", "9").on("mouseover", function () {
            //d3.select(".policias0").attr("transform", "translate(0,2)");
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Instalación de juegos para niños y máquinas para hacer ejercicio por parte del IDRD")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    d3.select(".sillas39").style("stroke", '#444').attr("height", "15").attr("y", "3").attr("width", "9").on("mouseover", function () {
            //d3.select(".policias0").attr("transform", "translate(0,2)");
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Instalación de mobiliario urbano por parte del IDRD")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    d3.select(".arboles43").style("stroke", '#444').attr("height", "15").attr("y", "3").attr("width", "9").on("mouseover", function () {
            //d3.select(".policias0").attr("transform", "translate(0,2)");
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html("Siembra de árboles nativos por parte de la Secretaría del Medio Ambiente")
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function () {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });
    
    


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
        if (opacidadAsignada == undefined) {
            opacidadAsignada = 0.05;
        }

        opacidadesGuardas.push(opacidadAsignada);
        l.opacidad = opacidadesGuardas[each];
    }


}