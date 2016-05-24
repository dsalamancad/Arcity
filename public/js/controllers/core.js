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
    var fechaInicialGlobalPuntos = new Date(2015, 0, 1);
    var fechaFinalGlobalPuntos = new Date(2016, 1, 1);

    var capaConPuntosCargados;
    //new Date(2014, 11, 22), new Date(2015, 11, 22)

    var dibujarMapa = function (data) {
        // console.log(data);
        //console.log(data.features[5].properties.id);

        //Creación del mapa de leaflet SIN DC


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
            attribution: osmAttrib,
            opacity: .4,
        })); // El mapa base que se va a utilizar (debe importarse la librería correspondiente en index.html)
        map._layersMaxZoom = 18; // Definie el máximo zoom del mapa
        map._layersMinZoom = 10;

        L.control.scale({ // Maneja la escala
            position: 'bottomleft', // .. donde aparece
            imperial: false // .. sistema métrico
        }).addTo(map);



        //         capaConPuntosCargados = L.geoJson(data, {
        //
        //                    style: function (feature) {
        //                        return {
        //                            radius: (feature.properties.id) / 8
        //                        };
        //                    },
        //                    pointToLayer: function (feature, latlng) {
        //                        return L.circleMarker(latlng, geojsonMarkerOptions);
        //                    },
        //                    onEachFeature: function (feature, layer) {
        //                        layer.bindPopup(feature.properties.descripcio);
        //                    }
        //                });
        //                capaConPuntosCargados.addTo(map);


        var datosInvasionEspacioPublico = data.features;


        var fechaCompletaFormateada = d3.time.format('%Y-%m-%d' + 'T' + '%H:%M:%S.%L' + 'Z');
        //2015-07-27T00:00:00.000Z"
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
            d.properties.policia = +d.properties.policia;
            d.properties.canecas = +d.properties.canecas;

            //console.log(d.properties.policia);
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
            }),
            dimensionPolicia = ndx.dimension(function (d) {
                return d.properties.policia;
            }),
            dimensionCanecas = ndx.dimension(function (d) {
                return d.properties.canecas;
            });




        //creación de grupos
        var todas = ndx.groupAll();
        var conteoPorAno = dimensionAno.group().reduceCount(),
            conteoPorMes = dimensionMes.group().reduceCount(),
            conteoPorDia = dimensionDia.group().reduceCount(),
            conteoPorSeguidores = dimensionSeguidores.group().reduceCount(),
            conteoPorRespondido = dimensionRespondido.group().reduceCount(),
            conteoPorFecha = dimensionFecha.group().reduceCount(),
            policiasPorDia = dimensionFecha.group().reduceSum(function (d) {
                return d.properties.policia;
            }),
            arbolesPorDia = dimensionFecha.group().reduceSum(function (d) {
                return d.properties.arbol;
            }),
            canecasPorDia = dimensionFecha.group().reduceSum(function (d) {
                return d.properties.caneca;
            }),
            estacionesPorDia = dimensionFecha.group().reduceSum(function (d) {
                return d.properties.estacion;
            }),
            juegosPorDia = dimensionFecha.group().reduceSum(function (d) {
                return d.properties.juego;
            }),
            sillasPorDia = dimensionFecha.group().reduceSum(function (d) {
                return d.properties.silla;
            }),
            lucesPorDia = dimensionFecha.group().reduceSum(function (d) {
                return d.properties.luz;
            });
        //todospolicias = dimensionPolicia.group().reduceSum(function(d) { return d.value });


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
            graficaLineaDeTiempo = dc.lineChart('#lineaDetiempo'),
            graficaEvolucionTiempo = dc.compositeChart("#evolucionTiempo"),
            graficaTotalesReportes = dc.compositeChart('#reportesTotales');



        var EscalaOrdinal = d3.scale.ordinal()
            .domain(["Policias", "Árboles", "Basuras", "Acceso", "Juegos", "Sillas", "Luz"]);



        var dimensionesNombreCategorias = ndx.dimension(function (d) {
            return d.properties;
        });
        var todospolicias = dimensionesNombreCategorias.group().reduceSum(function (d) {
            return d.properties.policia;
        });
        var todosarboles = dimensionesNombreCategorias.group().reduceSum(function (d) {
            return d.properties.arbol;
        });
        var todosbasuras = dimensionesNombreCategorias.group().reduceSum(function (d) {
            return d.properties.caneca;
        });
        var todosacceso = dimensionesNombreCategorias.group().reduceSum(function (d) {
            return d.properties.estacion;
        });
        var todosjuegos = dimensionesNombreCategorias.group().reduceSum(function (d) {
            return d.properties.juego;
        });
        var todossillas = dimensionesNombreCategorias.group().reduceSum(function (d) {
            return d.properties.silla;
        });
        var todosluces = dimensionesNombreCategorias.group().reduceSum(function (d) {
            return d.properties.luz;
        });




        //console.log(datosInvasionEspacioPublico);
        //var chart = dc.barChart("#test");
        //chart
        //  .width(500)
        //  .height(200)
        //  .x(EscalaOrdinal)
        //  .xUnits(dc.units.ordinal)
        //  .brushOn(false)
        //  .xAxisLabel("Categorias")
        //  .yAxisLabel("Cantidad de propuestas")
        //  .dimension(dimensionesNombreCategorias)
        //  .barPadding(0.1)
        //  .outerPadding(0.05)
        //  .group(todospolicias)
        //.stack(todosarboles);
        //
        //chart.render();







        graficaTotalesReportes
            .width(630).height(150)
            .x(EscalaOrdinal)
            .xUnits(dc.units.ordinal)
            .elasticY(false)
            .compose([
                dc.barChart(graficaTotalesReportes).group(todospolicias, "Policias").ordinalColors(['#0070bb']),
                dc.barChart(graficaTotalesReportes).group(todosarboles, "Árboles").ordinalColors(['#30bb51']),
                dc.barChart(graficaTotalesReportes).group(todosbasuras, "Basuras").ordinalColors(['#bc6731']),
                dc.barChart(graficaTotalesReportes).group(todosacceso, "Acceso").ordinalColors(['#ffb92e']),
                dc.barChart(graficaTotalesReportes).group(todosjuegos, "Juegos").ordinalColors(['#e31b20']),
                dc.barChart(graficaTotalesReportes).group(todossillas, "Sillas").ordinalColors(['#5a31bc']),
                dc.barChart(graficaTotalesReportes).group(todosluces, "Luces").ordinalColors(['#dfdc13']),
        ]);

        graficaLineaDeTiempo
            .width(1060).height(60)
            .dimension(dimensionFecha)
            .group(todospolicias)
            .renderVerticalGridLines(true)
            .margins({
                top: 10,
                right: 80,
                bottom: 20,
                left: 30
            })
            //.filter(dc.filters.RangedFilter(new Date(2016, 1, 1), new Date(2016, 3, 1)))
            .filter(dc.filters.RangedFilter(minDate, maxDate))
            .x(d3.time.scale().domain([minDate, maxDate]));

        graficaEvolucionTiempo
            .width(1060).height(150)
            .dimension(dimensionFecha)
            .margins({
                top: 10,
                right: 80,
                bottom: 20,
                left: 30
            })
            .x(d3.time.scale().domain([minDate, maxDate]))
            .brushOn(false)
            .legend(dc.legend().x(1000).y(10).itemHeight(13).gap(5))
            //            .yAxisLabel("Reportes por día")
            .compose([
                dc.lineChart(graficaEvolucionTiempo).group(policiasPorDia, "Policias").ordinalColors(['#0070bb']),
                dc.lineChart(graficaEvolucionTiempo).group(arbolesPorDia, "Árboles").ordinalColors(['#30bb51']),
                dc.lineChart(graficaEvolucionTiempo).group(canecasPorDia, "Canecas").ordinalColors(['#bc6731']),
                dc.lineChart(graficaEvolucionTiempo).group(estacionesPorDia, "Estaciones").ordinalColors(['#ffb92e']),
                dc.lineChart(graficaEvolucionTiempo).group(juegosPorDia, "Juegos").ordinalColors(['#e31b20']),
                dc.lineChart(graficaEvolucionTiempo).group(sillasPorDia, "Sillas").ordinalColors(['#5a31bc']),
                dc.lineChart(graficaEvolucionTiempo).group(estacionesPorDia, "Luces").ordinalColors(['#dfdc13']),
            ]);
        //            .group(policiasPorDia, "Policias")
        //            .stack(arbolesPorDia, "Árboles")
        //            .stack(canecasPorDia, "Canecas")
        //            .stack(estacionesPorDia, "Estaciones")
        //            .stack(juegosPorDia, "Juegos")
        //            .stack(sillasPorDia, "Sillas")
        //            .stack(lucesPorDia, "Luces")
        //            .renderVerticalGridLines(true)

        graficaAno
            .width(120)
            .height(120)
            .dimension(dimensionAno)
            .group(conteoPorAno)
            .innerRadius(20)
            .ordinalColors(['#3182bd', '#cc4878', '#4c001c', '#ccbe48', '#4c4400', '#00bf75', '#01663f', '#cc4602', '#592d16', '#000be6', '#000566', '#c951e6']);

        graficaMes
            .width(120)
            .height(120)
            .dimension(dimensionMes)
            .group(conteoPorMes)
            .innerRadius(20)
            .ordinalColors(['#3182bd', '#cc4878', '#4c001c', '#ccbe48', '#4c4400', '#00bf75', '#01663f', '#cc4602', '#592d16', '#000be6', '#000566', '#c951e6']);
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
        //            .ordinalColors(['#3182bd', '#cc4878', '#4c001c', '#ccbe48', '#4c4400', '#00bf75', '#01663f', '#cc4602', '#592d16', '#000be6', '#000566', '#c951e6']);
        //graficaDia.xAxis().tickValues([0, 1, 2, 3, 4, 5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);

        graficaSeguidores
            .width(360)
            .height(140)
            .dimension(dimensionSeguidores)
            .group(conteoPorSeguidores)
            .x(d3.scale.linear().domain([0, 11]))
            .elasticY(false)
            .centerBar(false)
            .barPadding(0.3)
            //.xAxisLabel('Votos / Likes')
            .yAxisLabel('No. de Intervenciones')
            .margins({
                top: 10,
                right: 20,
                bottom: 20,
                left: 40
            }).ordinalColors(['#888', '#cc4878', '#4c001c', '#ccbe48', '#4c4400', '#00bf75', '#01663f', '#cc4602', '#592d16', '#000be6', '#000566', '#c951e6']);
        graficaSeguidores.xAxis().tickValues([" ", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, " "]);

        graficaRespondido
            .width(140)
            .height(140)
            .dimension(dimensionRespondido)
            .group(conteoPorRespondido)
            .innerRadius(20)
            .ordinalColors(['#888', '#cc4878', '#4c001c', '#ccbe48', '#4c4400', '#00bf75', '#01663f', '#cc4602', '#592d16', '#000be6', '#000566', '#c951e6']);

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
                    return d.properties.id;
        },
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
                },
        function (d) {
                    var laimagen;
                    laimagen = "<img style='width:500px' src='imagenes/capturasReportes/" + d.properties.id + ".jpg' >";
                    return laimagen;
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
//                    var radio = d.properties.seguidores;
                    var radio = 4;
                    //var name = d.brewery.brewery_name;
                    var marker = L.circleMarker([loc.coordinates[1], loc.coordinates[0]], {
                        fillColor: "#666",
                        color: "#fff",
                        weight: 0.5,
                        opacity: 1,
                        fillOpacity: 0.8,
                        radius: radio,

                    });
                    marker.bindPopup("<div id='popUpMarker'><img style='width:150px' src='imagenes/capturasReportes/" + d.properties.id + ".jpg' > <div id='fecha'><span>fecha: </span>"  +d.properties.fecha_dia+ "/" +d.properties.fecha_mes+ "/"+ d.properties.fecha_ano + "</div><div id='votos'><span>Likes: </span>" + d.properties.seguidores + "</div><div id='votos'><span>ID: </span>" + d.properties.id + "</div><div id='elementosUsados'> <div id='tituloelementosusados'> <span>Elementos Usados:</span> </div><div><img src='imagenes/iconos/iconoPolicia.png'><span class='valorenpopup'>" + d.properties.policia + "</span></div><div><img src='imagenes/iconos/iconoCaneca.png'><span class='valorenpopup'>" + d.properties.caneca + "</span></div><div><img src='imagenes/iconos/iconoSilla.png'><span class='valorenpopup'>" + d.properties.silla + "</span></div><div><img src='imagenes/iconos/iconoEstacion.png'><span class='valorenpopup'>" + d.properties.estacion + "</span></div><div><img src='imagenes/iconos/iconoJuego.png'><span class='valorenpopup'>" + d.properties.juego + "</span></div><div><img src='imagenes/iconos/iconoArbol.png'><span class='valorenpopup'>" + d.properties.arbol + "</span></div><div><img src='imagenes/iconos/iconoLuz.png'><span class='valorenpopup'>" + d.properties.luz + "</div></div></div>");
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


    }

//    $scope.filtrarPorValor = function () {
//        d3.selectAll("#capad3Hora svg").remove();
//        map.removeLayer(capaConPuntosCargados);
//        coneccion.llamarFiltroporHora({
//            callback: dibujarMapa,
//            horaInicial: $scope.horaInicialFiltro,
//            horaFinal: $scope.horaFinalFiltro
//        });
//    }
    

    coneccion.llamarFiltroporHora({
        callback: dibujarMapa,
        fechaInicial: fechaInicialGlobalPuntos,
        fechaFinal: fechaFinalGlobalPuntos
         
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
