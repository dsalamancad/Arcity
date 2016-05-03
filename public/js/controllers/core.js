var my_angular_app = angular.module('my_angular_app', []);

my_angular_app.service("coneccion", function () {
    //este servicio lo uso para comunicarme con el servidor. Aca va todos los sockets.
    var socket = io();

    //tiene el uid y el metodo
    var callbacksMapa = {};


    socket.on("mapaFiltrado", function (params) {
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
    var llamarFiltroporHora = function (params) {
        //console.log(params);

        var guid = genGuid();
        callbacksMapa[guid] = params.callback;
        params["caller"] = guid;
        socket.emit("filtrarHora", params);


    }

    return {
        llamarFiltroporHora: llamarFiltroporHora,

    };
})

my_angular_app.controller("home_controller", ["$scope", "coneccion", function ($scope, coneccion) {
    //console.log($scope);
    var socket = io();
    //    $scope.title = "Lista de Tareas";
    //    $scope.taskList = [];
    //    $scope.newTask = "";

    var capaConPuntosCargados;

    //  borrar
    //  function onEachFeature(feature, layer) {
    //        // does this feature have a property named popupContent?
    //        if (feature.properties && feature.properties.id) {
    //            layer.bindPopup(feature.properties.id);
    //        }
    //    }
    var geojsonMarkerOptions = {
        fillColor: "#2354ae",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    var dibujarMapa = function (data) {
        console.log(data);
        //console.log(data.features[5].properties.id);

        //Creación del mapa de leaflet SIN DC
        //        capaConPuntosCargados = L.geoJson(data, {
        //
        //            style: function (feature) {
        //                return {
        //                    radius: (feature.properties.id) / 8
        //                };
        //            },
        //            pointToLayer: function (feature, latlng) {
        //                return L.circleMarker(latlng, geojsonMarkerOptions);
        //            },
        //            onEachFeature: function (feature, layer) {
        //                layer.bindPopup(feature.properties.descripcio);
        //            }
        //        });
        //        capaConPuntosCargados.addTo(map);

        //CONSTRUCCION DE INTERACTIVO CON CROSSFILTER Y DC
        var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
            osm = new L.TileLayer(osmUrl, {
                maxZoom: 18,
                attribution: osmAttrib
            });




        var map = L.map('map').setView([4.607038, -74.068819], 16);
        var marcadoresIntervenciones = new L.FeatureGroup();

        map.addLayer(new L.TileLayer(osmUrl, {
            maxZoom: 18,
            attribution: osmAttrib
        })); // El mapa base que se va a utilizar (debe importarse la librería correspondiente en index.html)
        map._layersMaxZoom = 18; // Definie el máximo zoom del mapa
        map._layersMinZoom = 10;

        L.control.scale({ // Maneja la escala
            position: 'bottomleft', // .. donde aparece
            imperial: false // .. sistema métrico
        }).addTo(map);


        var datosInvasionEspacioPublico = data.features;


        var fechaCompletaFormateada = d3.time.format('%Y-%m-%d' + 'T' + '%H:%M:%S' + 'Z');
        //2015-07-24T08:53:16Z
        var anoFormateado = d3.time.format('%Y');
        var mesFormateado = d3.time.format('%m');
        var diaFormateado = d3.time.format('%d');
        var horaFormateada = d3.time.format('%H');

        // normalizar/parseo de data para dc
        datosInvasionEspacioPublico.forEach(function (d) {
            d.properties.seguidores = +d.properties.seguidores;
            d.properties.respondido = +d.properties.respondido;
            d.properties.fecha_fecha = fechaCompletaFormateada.parse(d.properties.fecha);
            d.properties.fecha_ano = +anoFormateado(d.properties.fecha_fecha);
            d.properties.fecha_mes = +mesFormateado(d.properties.fecha_fecha);
            d.properties.fecha_dia = +diaFormateado(d.properties.fecha_fecha);
            d.properties.fecha_hora = +horaFormateada(d.properties.fecha_fecha);

        });

        var ndx = crossfilter(datosInvasionEspacioPublico);


        //Creación de dimensiones
        var dimensionAno = ndx.dimension(function (d) {
                return d.properties.fecha_ano;
            }),
            dimensionMes = ndx.dimension(function (d) {
                return d.properties.fecha_mes;
            }),
            dimensionDia = ndx.dimension(function (d) {
                return d.properties.fecha_dia;
            }),
            dimensionSeguidores = ndx.dimension(function (d) {
                return d.properties.seguidores;
            }),
            dimensionRespondido = ndx.dimension(function (d) {
                return d.properties.respondido;
            }),
            dimensionesTodas = ndx.dimension(function (d) {
                return d.properties;
            }),
            dimensionFecha = ndx.dimension(function (d) {
                return d.properties.fecha_fecha;
            });



        //creación de grupos
        var todas = ndx.groupAll();
        var conteoPorAno = dimensionAno.group().reduceCount(),
            conteoPorMes = dimensionMes.group().reduceCount(),
            conteoPorDia = dimensionDia.group().reduceCount(),
            conteoPorSeguidores = dimensionSeguidores.group().reduceCount(),
            conteoPorRespondido = dimensionRespondido.group().reduceCount(),
            conteoPorFecha = dimensionFecha.group().reduceCount();
        var minDate = dimensionFecha.bottom(1)[0].properties.fecha_fecha;
        var maxDate = dimensionFecha.top(1)[0].properties.fecha_fecha;
        //Creacion de gráficas
        //Creación de variables (objetos de dc)
        var graficaAno = dc.pieChart('#graficaAnual'),
            graficaMes = dc.pieChart('#graficaMensual'),
            //graficaDia = dc.barChart('#graficaDiaria'),
            graficaSeguidores = dc.barChart('#usuariosPorReporte'),
            graficaRespondido = dc.pieChart('#reportesRespondidos'),
            dataCount = dc.dataCount('#data-count'),
            dataTable = dc.dataTable('#data-table'),
            graficaLineaDeTiempo = dc.lineChart('#lineaDetiempo');

        graficaLineaDeTiempo
            .width(1000).height(70)
            .dimension(dimensionFecha)
            .group(conteoPorSeguidores)
         .renderVerticalGridLines(true)
            .x(d3.time.scale().domain([minDate, maxDate]));

        graficaAno
            .width(120)
            .height(120)
            .dimension(dimensionAno)
            .group(conteoPorAno)
            .innerRadius(20)
            .ordinalColors(['#044265', '#cc4878', '#4c001c', '#ccbe48', '#4c4400', '#00bf75', '#01663f', '#cc4602', '#592d16', '#000be6', '#000566', '#c951e6']);

        graficaMes
            .width(120)
            .height(120)
            .dimension(dimensionMes)
            .group(conteoPorMes)
            .innerRadius(20)
            .ordinalColors(['#044265', '#cc4878', '#4c001c', '#ccbe48', '#4c4400', '#00bf75', '#01663f', '#cc4602', '#592d16', '#000be6', '#000566', '#c951e6']);
//
//        graficaDia
//            .width(600)
//            .height(180)
//            .dimension(dimensionDia)
//            .group(conteoPorDia)
//            .x(d3.scale.linear().domain([0, 30]))
//            .elasticY(true)
//            .centerBar(true)
//            .barPadding(5)
//            .xAxisLabel('Día')
//            .yAxisLabel('No. de Intervenciones')
//            .margins({
//                top: 10,
//                right: 20,
//                bottom: 50,
//                left: 50
//            })
//            .ordinalColors(['#044265', '#cc4878', '#4c001c', '#ccbe48', '#4c4400', '#00bf75', '#01663f', '#cc4602', '#592d16', '#000be6', '#000566', '#c951e6']);
        //graficaDia.xAxis().tickValues([0, 1, 2, 3, 4, 5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);

        graficaSeguidores
            .width(400)
            .height(160)
            .dimension(dimensionSeguidores)
            .group(conteoPorSeguidores)
            .x(d3.scale.linear().domain([0, 10]))
            .elasticY(true)
            .centerBar(true)
            .barPadding(0.3)
            .xAxisLabel('Votos / Likes')
            .yAxisLabel('No. de Intervenciones')
            .margins({
                top: 10,
                right: 20,
                bottom: 50,
                left: 40
            }).ordinalColors(['#044265', '#cc4878', '#4c001c', '#ccbe48', '#4c4400', '#00bf75', '#01663f', '#cc4602', '#592d16', '#000be6', '#000566', '#c951e6']);
        graficaSeguidores.xAxis().tickValues([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

        graficaRespondido
            .width(120)
            .height(120)
            .dimension(dimensionRespondido)
            .group(conteoPorRespondido)
            .innerRadius(20)
            .ordinalColors(['#044265', '#cc4878', '#4c001c', '#ccbe48', '#4c4400', '#00bf75', '#01663f', '#cc4602', '#592d16', '#000be6', '#000566', '#c951e6']);

        dataCount
            .dimension(ndx)
            .group(todas);

        dataTable
            .dimension(dimensionesTodas)
            .group(function (d) {
                return 'dc.js insists on putting a row here so I remove it using JS';
            })
            .size(100)
            .columns([
      function (d) {
                    return d.properties.usuario;
                },
      function (d) {
                    return d.properties.fecha_ano;
                },
      function (d) {
                    return d.properties.fecha_mes;
                },
      function (d) {
                    return d.properties.descripcio;
                },
      function (d) {
                    return d.properties.seguidores;
                }
    ])
            .sortBy(function (d) {
                return d.properties.seguidores;
            })
            .order(d3.descending)
            .on('renderlet', function (table) {
                // each time table is rendered remove nasty extra row dc.js insists on adding
                table.select('tr.dc-table-group').remove();

                // update map with breweries to match filtered data
                marcadoresIntervenciones.clearLayers();

                dimensionesTodas.top(Infinity).forEach(function (d) {
                    var loc = d.geometry;
                    //var name = d.brewery.brewery_name;
                    var marker = L.marker([loc.coordinates[1], loc.coordinates[0]]);
                    marker.bindPopup("<div id='popUpMarker'> <div id='fecha'><span>fecha: </span>"+ d.properties.fecha_fecha+"</div><div id='votos'><span>Votos: </span>"+d.properties.seguidores+"</div><div id='elementosUsados'> <div> <span>Elementos Usados:</span> </div><div><span>Policias: </span>1</div><div><span>Canecas: </span>2</div><div><span>Asientos: </span>0</div><div><span>Paraderos: </span>1</div><div><span>Juegos: </span>3</div><div><span>Árboles: </span>2</div><div><span>Luces: </span>0</div></div></div>");
                    marcadoresIntervenciones.addLayer(marker);


                });
                map.addLayer(marcadoresIntervenciones);
                map.fitBounds(marcadoresIntervenciones.getBounds());
            });

        //Filtros
        d3.selectAll('a#resetearTodo').on('click', function () {
            dc.filterAll();
            dc.renderAll();
        });

        d3.selectAll('a#resetearAno').on('click', function () {
            graficaAno.filterAll();
            dc.redrawAll();
        });

        d3.selectAll('a#resetearMes').on('click', function () {
            graficaMes.filterAll();
            dc.redrawAll();
        });

        d3.selectAll('a#resetearDia').on('click', function () {
            graficaDia.filterAll();
            dc.redrawAll();
        });
        d3.selectAll('a#resetearVotos').on('click', function () {
            graficaSeguidores.filterAll();
            dc.redrawAll();
        });
        d3.selectAll('a#resetearRespondidos').on('click', function () {
            graficaRespondido.filterAll();
            dc.redrawAll();
        });






        // showtime!
        dc.renderAll();

        console.log(conteoPorAno);

        // Creación de gráfica de d3
        var w = 800;
        var h = 100;
        var margin = {
            top: 58,
            bottom: 100,
            left: 80,
            right: 40
        };
        var width = w - margin.left - margin.right;
        var height = h - margin.top - margin.bottom;
        var parseoHora = d3.time.format("%H:%M:%S").parse;

        var x = d3.time.scale()
            .domain([parseoHora("00:00:00"), parseoHora("24:00:00")])
            //            .domain(d3.extent(data.features,function(d){
            //                var hora = parseoHora(d.properties.hora);
            //                return hora;
            //
            //            }))
            .range([0, width]);
        // console.log(data);
        //console.log(data.features[0].properties.hora);
        var svg = d3.select("#capad3Hora").append("svg")
            .attr("id", "chart")
            .attr("width", w)
            .attr("height", h)
            .attr("id", "chart")
            .attr("width", w)
            .attr("height", h);
        svg.selectAll(".bar")
            .data(data.features)
            .enter()
            .append("circle")
            .attr("class", "point")
            .attr("r", 10)
            .attr("cx", function (d) {
                var date = parseoHora(d.properties.hora);
                //console.log(date);
                return x(date);
            })
            .attr("cy", 20)
            // Final gráfica de d3
    }

    $scope.filtrarPorValor = function () {
        d3.selectAll("#capad3Hora svg").remove();
        map.removeLayer(capaConPuntosCargados);
        coneccion.llamarFiltroporHora({
            callback: dibujarMapa,
            horaInicial: $scope.horaInicialFiltro,
            horaFinal: $scope.horaFinalFiltro
        });
    }

    coneccion.llamarFiltroporHora({
        callback: dibujarMapa,
        horaInicial: 0,
        horaFinal: 24
    });

    // ------------------------------------------------------
    // Functions mapa de geotabula
    // ------------------------------------------------------
    //    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    //        osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    //        osm = new L.TileLayer(osmUrl, {
    //            maxZoom: 18,
    //            attribution: osmAttrib
    //        });
    //
    //
    //
    //
    //    var map = L.map('map').setView([4.607038, -74.068819], 16); // Posición inical del mapa (lat, long, zoom)
    //    map.addLayer(new L.TileLayer(osmUrl, {
    //        maxZoom: 18,
    //        attribution: osmAttrib
    //    })); // El mapa base que se va a utilizar (debe importarse la librería correspondiente en index.html)
    //    map._layersMaxZoom = 18; // Definie el máximo zoom del mapa
    //    map._layersMinZoom = 10;
    //    //    L.marker([4.606983, -74.068004]).bindLabel('Casa acal!', {
    //    //            noHide: true
    //    //        })
    //    //        .addTo(map);
    //
    //    L.control.scale({ // Maneja la escala
    //        position: 'bottomleft', // .. donde aparece
    //        imperial: false // .. sistema métrico
    //    }).addTo(map);




}]);
