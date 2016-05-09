var my_angular_app = angular.module('my_angular_app', []);

my_angular_app.service("coneccion", function () {
    //este servicio lo uso para comunicarme con el servidor. Aca va todos los sockets.
    var socket = io();
    //tiene el uid y el metodo
    var callbacksMapa = {};

    socket.on("manzanasFiltradas", function (params) {
        //console.log("llamado 4");
        //llamar el callback que tien el guid y le paso como parametro el geojson
        callbacksMapa[params.guid](params.geojson);
        delete callbacksMapa[params.guid];
    });

    socket.on("reportesPorManzanasFiltradas", function (params) {
        //console.log(params);
        //llamar el callback que tien el guid y le paso como parametro el geojson
        callbacksMapa[params.guid](params.geojson);
        delete callbacksMapa[params.guid];
    });

    //generar identificadores únicos con el objetivo de poder identificar quien está haciendo el llamado.
    var genGuid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };
    //este es mi metodod que voy a usar
    var llamarFiltroManzanas = function (params) {
        //console.log("llamado 1");
        var guid = genGuid();
        callbacksMapa[guid] = params.callback;
        params["caller"] = guid;
        socket.emit("llamarManzanas", params);
    }

    var llamarFiltroReportesPorManzanas = function (params) {
        //console.log(params);
        var guid = genGuid();
        callbacksMapa[guid] = params.callback;
        params["caller"] = guid;
        socket.emit("llamarReportesPorManzanas", params);
    }
    return {
        llamarFiltroManzanas: llamarFiltroManzanas,
        llamarFiltroReportesPorManzanas: llamarFiltroReportesPorManzanas,
    };
})


my_angular_app.controller("home_controller", ["$scope", "coneccion", function ($scope, coneccion) {
    //console.log($scope);
    var socket = io();
    var capaConPoligonosCargados, capaConPoligonosCargadosPolicia;
    var capaConPoligonosMulticoloresCargados;
    var guardaPoligonos = [];
    var guardaOpacidad = [];
    var opacidadesPoligonos = {};
    var opacidadesPoligonosPolicia = {};
    //variables iniciales para llamar a los filtros
    var fechaInicialGlobal = new Date(2015, 0, 1);
    var fechaFinalGlobal = new Date(2016, 10, 1);
    var geojsonMarkerOptions = {
        "color": "#ff7800",
        "weight": 1,
        "opacity": 1
    };

    var geojsonMarkerOptionsPolicia = {
        "color": "#0070bb",
        "weight": 1,
        "opacity": 1
    };

    // FUNCIONES LLAMADAS CUANDO VUEVLE EL MENSAJE DEL SERVIDOR
    var dibujarMapa = function (data) {
        //console.log("llamado 5");
        //console.log(data);
        capaConPoligonosCargados = L.geoJson(data, {
            style: geojsonMarkerOptions
        });

        capaConPoligonosCargadosPolicia = L.geoJson(data, {
            style: geojsonMarkerOptionsPolicia
        });

        // me llama los reportes por poligono
        coneccion.llamarFiltroReportesPorManzanas({
            callback: definirTransparencia,
            fechaInicial: fechaInicialGlobal,
            fechaFinal: fechaFinalGlobal,
        });
        capaConPoligonosCargados.addTo(map);
        capaConPoligonosCargadosPolicia.addTo(mapaPolicia);
    }

    //función para meter en arrays los valores de poligono y su numero de reportes
    var definirTransparencia = function (data) {
        //console.log("llamado 6");
        //console.log(data);
        var maximoReportesporManzana = d3.max(data, function (d) {
            return Number(d.totale);
        });
        var maximoReportesporManzanaPolicia = d3.max(data, function (d) {
            return Number(d.policias);
        });
        //var maximoReportesporManzana = 25;

        for (var i = 0; i < data.length; i++) {
            //console.log(maximoReportesporManzana);
            if (data[i].totale >= 0 && data[i].totale <= maximoReportesporManzana / 4) {
                opacidadesPoligonos[data[i].gid] = 0.1;
            } else if (data[i].totale > maximoReportesporManzana / 4 && data[i].totale <= (maximoReportesporManzana / 4) * 2) {
                opacidadesPoligonos[data[i].gid] = 0.4;
            } else if (data[i].totale > (maximoReportesporManzana / 4) * 2 && data[i].totale <= (maximoReportesporManzana / 4) * 3) {
                opacidadesPoligonos[data[i].gid] = 0.7;
            } else {
                opacidadesPoligonos[data[i].gid] = 1;
            }
        }

         for (var i = 0; i < data.length; i++) {
            //console.log(maximoReportesporManzanaPolicia);
            if (data[i].policias >= 0 && data[i].policias <= maximoReportesporManzanaPolicia / 4) {
                opacidadesPoligonosPolicia[data[i].gid] = 0.1;
            } else if (data[i].policias > maximoReportesporManzanaPolicia / 4 && data[i].policias <= (maximoReportesporManzanaPolicia / 4) * 2) {
                opacidadesPoligonosPolicia[data[i].gid] = 0.4;
            } else if (data[i].policias > (maximoReportesporManzanaPolicia / 4) * 2 && data[i].policias <= (maximoReportesporManzanaPolicia / 4) * 3) {
                opacidadesPoligonosPolicia[data[i].gid] = 0.7;
            } else {
                opacidadesPoligonosPolicia[data[i].gid] = 1;
            }
         }


            //opacidadesPoligonos[data[i].gid] = Number(data[i].totale) / maximoReportesporManzana;


        // me llama la función que asigna transparencia
        aplicarEstilo();

    }

    //función para crear estilo de cada poligono
    var aplicarEstilo = function () {
        //console.log("llamado 7");
        for (each in capaConPoligonosCargados._layers) {
            var l = capaConPoligonosCargados._layers[each];
            var gid = l.feature.properties.gid;
            //console.log("opacidades poligones es" + opacidadesPoligonos[gid]);
            var opacidad = opacidadesPoligonos[gid];
            l.setStyle({
                color: "#144a78",
                fillOpacity: opacidad
            })

        }

        for (each in capaConPoligonosCargadosPolicia._layers) {
            var l = capaConPoligonosCargadosPolicia._layers[each];
            var gid = l.feature.properties.gid;
            //console.log("opacidades poligones es" + opacidadesPoligonos[gid]);
            var opacidad = opacidadesPoligonosPolicia[gid];
            l.setStyle({
                fillOpacity: opacidad
            })

        }
    }


    //HACER LLAMADOS AL SERVIDOR (EL CALLBACK ES LA FUNCI´ON QUE LLAMA CUANDO ME DEVUELVE EL SERVIDOR)
    // la usaré cuando sea filtrar por el timeline
    $scope.filtrarManzanas = function () {
        if (!d3.event.sourceEvent) return; // only transition after input
        var extent0 = brush.extent(),
            extent1 = extent0.map(d3.time.day.round);

        // if empty when rounded, use floor & ceil instead
        if (extent1[0] >= extent1[1]) {
            extent1[0] = d3.time.day.floor(extent0[0]);
            extent1[1] = d3.time.day.ceil(extent0[1]);
        }

        d3.select(this).transition()
            .call(brush.extent(extent1))
            .call(brush.event);


        fechaInicial = brush.extent()[0];
        fechaFinal = brush.extent()[1];

        //console.log("inicial: " + fechaInicial);
        //console.log("final: " + fechaFinal);
        //console.log(diaFinal + " " + mesFinal + " " + anoFinal);
        fechaInicialGlobal = fechaInicial;
        fechaFinalGlobal = fechaFinal;


        map.removeLayer(capaConPoligonosCargados);
        mapaPolicia.removeLayer(capaConPoligonosCargadosPolicia);

        coneccion.llamarFiltroManzanas({
            callback: dibujarMapa,
        });
    }


    // me llama los poligonos para dibujar
    coneccion.llamarFiltroManzanas({

        callback: dibujarMapa
    });


    //CREACION DEL MAPA DE GEOTABULA-----------------------------------------------------
    // llamar tiling de open street
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        osm = new L.TileLayer(osmUrl, {
            maxZoom: 16,
            attribution: osmAttrib,
        });

    // carga de tiling de open maps
    var map = L.map('mapEstado').setView([4.607038, -74.068819], 16); // Posición inical del mapa (lat, long, zoom)
    map.addLayer(new L.TileLayer(osmUrl, {
        maxZoom: 16,
        attribution: osmAttrib,
        opacity: .3,
    }));

     var mapaPolicia = L.map('mapaPolicia').setView([4.607038, -74.068819], 14); // Posición inical del mapa (lat, long, zoom)
    mapaPolicia.addLayer(new L.TileLayer(osmUrl, {
        maxZoom: 16,

        opacity: .3,
    }));

    //configuración general del mapa
    map._layersMaxZoom = 16;
    map._layersMinZoom = 16;
    L.control.scale({
        position: 'bottomleft', // .. donde aparece
        imperial: false // .. sistema métrico
    }).addTo(map);

    mapaPolicia._layersMaxZoom = 18;
    mapaPolicia._layersMinZoom = 10;
    L.control.scale({
        position: 'bottomleft', // .. donde aparece
        imperial: false // .. sistema métrico
    }).addTo(mapaPolicia);



    //CREACION DE LINEA DE TIEMPO PARA CONTROLAR
    var margin = {
            top: 0,
            right: 0,
            bottom: 20,
            left: 0
        },
        width = 960 - margin.left - margin.right,
        height = 70 - margin.top - margin.bottom;

    var x = d3.time.scale()
        .domain([new Date(2014, 12, 1), new Date(2016, 5, 1) - 1])
        .range([0, width]);

    var brush = d3.svg.brush()
        .x(x)
        .extent([new Date(2015, 1, 1), new Date(2016, 5, 1)])

    .on("brushend", $scope.filtrarManzanas);

    var svg = d3.select("body #timeLineControlEstado").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("rect")
        .attr("class", "grid-background")
        .attr("width", width)
        .attr("height", height);

    svg.append("g")
        .attr("class", "x grid")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(d3.time.days, 52)
            .tickSize(-height)
            .tickFormat(""))
        .selectAll(".tick")
        .classed("minor", function (d) {
            return d.getHours();
        });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(d3.time.months)
            .tickPadding(0))
        .selectAll("text")
        .attr("x", 6)
        .style("text-anchor", null);

    var gBrush = svg.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.event);

    gBrush.selectAll("rect")
        .attr("height", height);

    var fechaInicial, diaInicial, mesInicial, anoInicial;
    var fechaFinal, diaFinal, mesFinal, anoFinal;

    function brushended() {


        console.log(extent0[0] + " y " + extent0[1]);

    }

}]);
