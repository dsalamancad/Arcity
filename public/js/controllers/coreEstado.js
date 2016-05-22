var my_angular_app = angular.module('my_angular_app', []);
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

    socket.on("manzanasFiltradas", function (params) {

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
    socket.on("opacidadesSemanalesDefinidas", function (params) {
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
    var llamarFiltroporHora = function (params) {
        //console.log(params);

        var guid = genGuid();
        callbacksMapa[guid] = params.callback;
        params["caller"] = guid;
        socket.emit("filtrarHora", params);


    }

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

    var llamarOpacidadesSemana = function (params) {
        //console.log("llamado 1");
        var guid = genGuid();
        callbacksMapa[guid] = params.callback;
        params["caller"] = guid;
        socket.emit("llamarOpacidadesPorSemana", params);
    }

    return {
        llamarFiltroporHora: llamarFiltroporHora,
        llamarFiltroManzanas: llamarFiltroManzanas,
        llamarFiltroReportesPorManzanas: llamarFiltroReportesPorManzanas,
        llamarOpacidadesSemana: llamarOpacidadesSemana,
    };
})


my_angular_app.controller("home_controller", ["$scope", "coneccion", function ($scope, coneccion) {

    //console.log($scope);
    var pintarunavez = 1;
    var socket = io();
    var capaConPuntosCargados;
    var capaConPoligonosCargados, capaConPoligonosCargadosPolicia, capaConPoligonosCargadosArboles, capaConPoligonosCargadosBasuras, capaConPoligonosCargadosAcceso, capaConPoligonosCargadosJuegos, capaConPoligonosCargadosSillas, capaConPoligonosCargadosLuz;
    var capaConPoligonosMulticoloresCargados;
    var guardaPoligonos = [];
    var guardaOpacidad = [];
    var opacidadesPoligonos = {};
    var opacidadesPoligonosPolicia = {};
    var opacidadesPoligonosArboles = {};
    var opacidadesPoligonosBasuras = {};
    var opacidadesPoligonosAcceso = {};
    var opacidadesPoligonosJuegos = {};
    var opacidadesPoligonosSillas = {};
    var opacidadesPoligonosLuz = {};

    var cantidadDePolicias = {};
    var cantidadDeCanecas = {};
    var cantidadDeSillas = {};
    var cantidadDeEstaciones = {};
    var cantidadDeJuegos = {};
    var cantidadDeArboles = {};
    var cantidadDeLuces = {};
    //variables iniciales para llamar a los filtros
    var fechaInicialGlobal = new Date(2015, 0, 1);
    var fechaFinalGlobal = new Date(2016, 10, 1);
    var geojsonMarkerOptions = {
        "color": "#fff",
        "weight": 1,
        "opacity": 1
    };
    //ESTILOS POR DEFECTO DE LOS POLIGONOS
    var geojsonMarkerOptionsPolicia = {
        "color": "#0070bb",
        "weight": 0.5,
        "opacity": 1
    };
    var geojsonMarkerOptionsArboles = {
        "color": "#30bb51",
        "weight": 0.5,
        "opacity": 1
    };
    var geojsonMarkerOptionsBasuras = {
        "color": "#bc6731",
        "weight": 0.5,
        "opacity": 1
    };
    var geojsonMarkerOptionsAcceso = {
        "color": "#ffb92e",
        "weight": 0.5,
        "opacity": 1
    };
    var geojsonMarkerOptionsJuegos = {
        "color": "#e31b20",
        "weight": 0.5,
        "opacity": 1
    };
    var geojsonMarkerOptionsSillas = {
        "color": "#5a31bc",
        "weight": 0.5,
        "opacity": 1
    };
    var geojsonMarkerOptionsLuz = {
        "color": "#dfdc13",
        "weight": 0.5,
        "opacity": 1
    };

    //VARIABLES PARA HACER LA PONDERACIÓN DE LOS PESOS DEL GRÁFICO PRINCIPAL
    var pesoGlobalPolicia = 10,
        pesoGlobalArboles = 10,
        pesoGlobalBasuras = 10,
        pesoGlobalAcceso = 10,
        pesoGlobalJuegos = 10,
        pesoGlobalSillas = 10,
        pesoGlobalLuz = 10;
    //VARIABLES PARA CREAR GRAFICO DE COORDENADAS PARAELAS
    var nombresManzanas = ["m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12", "m13", "m14", "m15", "m16", "m17", "m18", "m19", "m20", "m21", "m22", "m23", "m24", "m25", "m26", "m27", "m28", "m29", "m30", "m31", "m32", "m33", "m34", "m35", "m36", "m37", "m38", "m39", "m40", "m41", "m42", "m43", "m44", "m45", "m46", "m47", "m48"]
        //var m1=[1, -0, 0, 0, 0, 3, 7, "m1"], m2=[1, -1, 1, 2, 1, 6, 1, "m2"],m3=[2, -2, 4, 4, 0.5, 2, 7, "m3"],m4=[3, -3, 9, 6, 0.33, 4, 5, "m4"], m5=[4, -4, 16, 8, 0.25, 9, 3, "m5"], m6=[5, -7, 16, 8, 0.25, 9, 5, "m6"], m7=[6, -3, 16, 8, 0.25, 9, 1, "m7"],m8=[7, -0, 0, 5, 0, 3, 6, "m8"],m9=[],m10=[],m11=[],m12=[],m13=[],m14=[],m15=[],m16=[],m17=[],m18=[],m19=[],m20=[],m21=[],m22=[],m23=[],m24=[],m25=[],m26=[],m27=[],m28=[],m29=[],m30=[],m31=[],m32=[],m33=[],m34=[],m35=[],m36=[],m37=[],m38=[],m39=[],m40=[],m41=[],m42=[],m43=[],m44=[],m45=[],m46=[],m47=[],m48=[];
    var m1 = [],
        m2 = [],
        m3 = [],
        m4 = [],
        m5 = [],
        m6 = [],
        m7 = [],
        m8 = [],
        m9 = [],
        m10 = [],
        m11 = [],
        m12 = [],
        m13 = [],
        m14 = [],
        m15 = [],
        m16 = [],
        m17 = [],
        m18 = [],
        m19 = [],
        m20 = [],
        m21 = [],
        m22 = [],
        m23 = [],
        m24 = [],
        m25 = [],
        m26 = [],
        m27 = [],
        m28 = [],
        m29 = [],
        m30 = [],
        m31 = [],
        m32 = [],
        m33 = [],
        m34 = [],
        m35 = [],
        m36 = [],
        m37 = [],
        m38 = [],
        m39 = [],
        m40 = [],
        m41 = [],
        m42 = [],
        m43 = [],
        m44 = [],
        m45 = [],
        m46 = [],
        m47 = [],
        m48 = [];

    var dataparalel = [
 m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15, m16, m17, m18, m19, m20, m21, m22, m23, m24, m25, m26, m27, m28, m29, m30, m31, m32, m33, m34, m35, m36, m37, m38, m39, m40, m41, m42, m43, m44, m45, m46, m47, m48,
];
    var pc;

    $scope.cambiarPesos = function () {
        pesoGlobalPolicia = $scope.pesoPolicia;
        pesoGlobalArboles = $scope.pesoArboles;
        pesoGlobalBasuras = $scope.pesoBasuras;
        pesoGlobalAcceso = $scope.pesoAcceso;
        pesoGlobalJuegos = $scope.pesoJuegos;
        pesoGlobalSillas = $scope.pesoSillas;
        pesoGlobalLuz = $scope.pesoLuz;
        map.removeLayer(capaConPoligonosCargados);
        mapaPolicia.removeLayer(capaConPoligonosCargadosPolicia);
        mapaArboles.removeLayer(capaConPoligonosCargadosArboles);
        mapaBasuras.removeLayer(capaConPoligonosCargadosBasuras);
        mapaAcceso.removeLayer(capaConPoligonosCargadosAcceso);
        mapaJuegos.removeLayer(capaConPoligonosCargadosJuegos);
        mapaSillas.removeLayer(capaConPoligonosCargadosSillas);
        mapaLuz.removeLayer(capaConPoligonosCargadosLuz);
        coneccion.llamarFiltroManzanas({
        callback: dibujarMapa
    });

        //PARA FROMULARIO
        alerta_policiaPonderados = pesoGlobalPolicia;
        alerta_arbolesPonderados = pesoGlobalArboles;
        alerta_basurasPonderados = pesoGlobalBasuras;
        alerta_accesoPonderados = pesoGlobalAcceso;
        alerta_juegoPonderados = pesoGlobalJuegos;
        alerta_sillasPonderados = pesoGlobalSillas;
        alerta_luzPonderados = pesoGlobalLuz;
        definirTransparencia(data);
    }

    var dibujarPuntos = function (data) {

        capaConPuntosCargados = L.geoJson(data, {

            style: function (feature) {
                return {
                    stroke: false,
                    color: "#fff",
                    fillColor: "#0a2438",
                    radius: 2,
                    fillOpacity: 0.5,
                };
            },
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, geojsonMarkerOptions);
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties.descripcio);
            }
        });
        capaConPuntosCargados.addTo(map);

    }

    // FUNCIONES LLAMADAS CUANDO VUEVLE EL MENSAJE DEL SERVIDOR
    var dibujarMapa = function (data) {
        capaConPoligonosCargados = L.geoJson(data, {
            style: geojsonMarkerOptions
        });

        capaConPoligonosCargadosPolicia = L.geoJson(data, {
            style: geojsonMarkerOptionsPolicia
        });
        capaConPoligonosCargadosArboles = L.geoJson(data, {
            style: geojsonMarkerOptionsArboles
        });
        capaConPoligonosCargadosBasuras = L.geoJson(data, {
            style: geojsonMarkerOptionsBasuras
        });
        capaConPoligonosCargadosAcceso = L.geoJson(data, {
            style: geojsonMarkerOptionsAcceso
        });
        capaConPoligonosCargadosJuegos = L.geoJson(data, {
            style: geojsonMarkerOptionsJuegos
        });
        capaConPoligonosCargadosSillas = L.geoJson(data, {
            style: geojsonMarkerOptionsSillas
        });
        capaConPoligonosCargadosLuz = L.geoJson(data, {
            style: geojsonMarkerOptionsLuz
        });



        // me llama los reportes por poligono
        coneccion.llamarFiltroReportesPorManzanas({
            callback: definirTransparencia,
            fechaInicial: fechaInicialGlobal,
            fechaFinal: fechaFinalGlobal,
        });
        capaConPoligonosCargados.addTo(map);
        capaConPoligonosCargadosPolicia.addTo(mapaPolicia);
        capaConPoligonosCargadosArboles.addTo(mapaArboles);
        capaConPoligonosCargadosBasuras.addTo(mapaBasuras);
        capaConPoligonosCargadosAcceso.addTo(mapaAcceso);
        capaConPoligonosCargadosJuegos.addTo(mapaJuegos);
        capaConPoligonosCargadosSillas.addTo(mapaSillas);
        capaConPoligonosCargadosLuz.addTo(mapaLuz);


    }



    //función para meter en arrays los valores de poligono y su numero de reportes
    var definirTransparencia = function (data) {
        // RESETEAR LOS ARRAYS PARA LA GRAFICA DE COORDENADAS PARALELAS
        m1 = [];
        m2 = [];
        m3 = [];
        m4 = [];
        m5 = [];
        m6 = [];
        m7 = [];
        m8 = [];
        m9 = [];
        m10 = [];
        m11 = [];
        m12 = [];
        m13 = [];
        m14 = [];
        m15 = [];
        m16 = [];
        m17 = [];
        m18 = [];
        m19 = [];
        m20 = [];
        m21 = [];
        m22 = [];
        m23 = [];
        m24 = [];
        m25 = [];
        m26 = [];
        m27 = [];
        m28 = [];
        m29 = [];
        m30 = [];
        m31 = [];
        m32 = [];
        m33 = [];
        m34 = [];
        m35 = [];
        m36 = [];
        m37 = [];
        m38 = [];
        m39 = [];
        m40 = [];
        m41 = [];
        m42 = [];
        m43 = [];
        m44 = [];
        m45 = [];
        m46 = [];
        m47 = [];
        m48 = [];
        dataparalel = [
 m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15, m16, m17, m18, m19, m20, m21, m22, m23, m24, m25, m26, m27, m28, m29, m30, m31, m32, m33, m34, m35, m36, m37, m38, m39, m40, m41, m42, m43, m44, m45, m46, m47, m48,
]
            // LLENAR LOS ARRAYS PARA LA GRAFICA DE COORDENADAS PARALELAS
        for (var i = 0; i < data.length; i++) {
            dataparalel[i].push(Number(data[i].policias));
        }
        for (var i = 0; i < data.length; i++) {
            dataparalel[i].push(Number(data[i].arbol));
        }
        for (var i = 0; i < data.length; i++) {
            dataparalel[i].push(Number(data[i].caneca));
        }
        for (var i = 0; i < data.length; i++) {
            dataparalel[i].push(Number(data[i].estacion));
        }
        for (var i = 0; i < data.length; i++) {
            dataparalel[i].push(Number(data[i].juego));
        }
        for (var i = 0; i < data.length; i++) {
            dataparalel[i].push(Number(data[i].silla));
        }
        for (var i = 0; i < data.length; i++) {
            dataparalel[i].push(Number(data[i].luz));
        }
        //        for (var i = 0; i < data.length; i++) {
        //            dataparalel[i].push(nombresManzanas[i]);
        //        }
        //CREACION DE COORDENADAS PARALELAS


        //document.getElementById("graficaCoordenadasParalelas").removeChild;
        d3.select("#graficaCoordenadasParalelas").html("");
        pc = d3.parcoords()("#graficaCoordenadasParalelas")
            .data(dataparalel)
            .render()
            .createAxes()
            .brushMode("1D-axes")
            .color("rgba(0,200,0,0.5)")
            .alphaOnBrushed(0.6)
            .brushedColor("#000");

        d3.select('#reseteoBrushParalel').on('click', function () {
            pc.brushReset();
        })


        var maximoReportesporManzana = d3.max(data, function (d) {
            // console.log(d.totale);
            return Number(d.totale);
        });
        var maximoReportesporManzanaPolicia = d3.max(data, function (d) {
            return Number(d.policias);
        });
        //document.getElementById("maxoimoPolicias").innerHTML = String(maximoReportesporManzanaPolicia);
        var maximoReportesporManzanaArboles = d3.max(data, function (d) {
            return Number(d.arbol);
        });
        var maximoReportesporManzanaBasuras = d3.max(data, function (d) {
            return Number(d.caneca);
        });
        var maximoReportesporManzanaAcceso = d3.max(data, function (d) {
            return Number(d.estacion);
        });
        var maximoReportesporManzanaJuegos = d3.max(data, function (d) {
            return Number(d.juego);
        });
        var maximoReportesporManzanaSillas = d3.max(data, function (d) {
            return Number(d.silla);
        });
        var maximoReportesporManzanaLuz = d3.max(data, function (d) {
            return Number(d.luz);
        });

        var reportesporManzanaPonderados = [];
        var maximoReportesporManzanaPonderados = d3.max(reportesporManzanaPonderados);

        var sumaPesos = pesoGlobalPolicia + pesoGlobalArboles + pesoGlobalBasuras + pesoGlobalAcceso + pesoGlobalJuegos + pesoGlobalSillas + pesoGlobalLuz;
        for (var i = 0; i < data.length; i++) {
            var totalsuma = (Number(data[i].policias) * pesoGlobalPolicia) + (Number(data[i].arbol) * pesoGlobalArboles) + (Number(data[i].caneca) * pesoGlobalBasuras) + (Number(data[i].estacion) * pesoGlobalAcceso) + (Number(data[i].juego) * pesoGlobalJuegos) + (Number(data[i].silla) * pesoGlobalSillas) + (Number(data[i].luz) * pesoGlobalLuz);

            var valorTotalPonderado = totalsuma / sumaPesos;
            reportesporManzanaPonderados.push(valorTotalPonderado);
        }
        maximoReportesporManzanaPonderados = d3.max(reportesporManzanaPonderados);


        for (var i = 0; i < data.length; i++) {
            if (reportesporManzanaPonderados[i] >= 0 && reportesporManzanaPonderados[i] <= maximoReportesporManzanaPonderados / 4) {
                opacidadesPoligonos[data[i].gid] = 0.1;
            } else if (reportesporManzanaPonderados[i] > maximoReportesporManzanaPonderados / 4 && reportesporManzanaPonderados[i] <= (maximoReportesporManzanaPonderados / 4) * 2) {
                opacidadesPoligonos[data[i].gid] = 0.4;
            } else if (reportesporManzanaPonderados[i] > (maximoReportesporManzanaPonderados / 4) * 2 && reportesporManzanaPonderados[i] <= (maximoReportesporManzanaPonderados / 4) * 3) {
                opacidadesPoligonos[data[i].gid] = 0.7;
            } else {
                opacidadesPoligonos[data[i].gid] = 1;
            }
            cantidadDePolicias[data[i].gid] = data[i].policias;
            cantidadDeCanecas[data[i].gid] = data[i].caneca;
            cantidadDeSillas[data[i].gid] = data[i].silla;
            cantidadDeEstaciones[data[i].gid] = data[i].estacion;
            cantidadDeJuegos[data[i].gid] = data[i].juego;
            cantidadDeArboles[data[i].gid] = data[i].arbol;
            cantidadDeLuces[data[i].gid] = data[i].luz;
        }

        for (var i = 0; i < data.length; i++) {
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

        for (var i = 0; i < data.length; i++) {
            if (data[i].arbol >= 0 && data[i].arbol <= maximoReportesporManzanaArboles / 4) {
                opacidadesPoligonosArboles[data[i].gid] = 0.1;
            } else if (data[i].arbol > maximoReportesporManzanaArboles / 4 && data[i].arbol <= (maximoReportesporManzanaArboles / 4) * 2) {
                opacidadesPoligonosArboles[data[i].gid] = 0.4;
            } else if (data[i].arbol > (maximoReportesporManzanaArboles / 4) * 2 && data[i].arbol <= (maximoReportesporManzanaArboles / 4) * 3) {
                opacidadesPoligonosArboles[data[i].gid] = 0.7;
            } else {
                opacidadesPoligonosArboles[data[i].gid] = 1;
            }
        }
        for (var i = 0; i < data.length; i++) {
            if (data[i].caneca >= 0 && data[i].caneca <= maximoReportesporManzanaBasuras / 4) {
                opacidadesPoligonosBasuras[data[i].gid] = 0.1;
            } else if (data[i].caneca > maximoReportesporManzanaBasuras / 4 && data[i].caneca <= (maximoReportesporManzanaBasuras / 4) * 2) {
                opacidadesPoligonosBasuras[data[i].gid] = 0.4;
            } else if (data[i].caneca > (maximoReportesporManzanaBasuras / 4) * 2 && data[i].caneca <= (maximoReportesporManzanaBasuras / 4) * 3) {
                opacidadesPoligonosBasuras[data[i].gid] = 0.7;
            } else {
                opacidadesPoligonosBasuras[data[i].gid] = 1;
            }
        }
        for (var i = 0; i < data.length; i++) {
            if (data[i].estacion >= 0 && data[i].estacion <= maximoReportesporManzanaAcceso / 4) {
                opacidadesPoligonosAcceso[data[i].gid] = 0.1;
            } else if (data[i].estacion > maximoReportesporManzanaAcceso / 4 && data[i].estacion <= (maximoReportesporManzanaAcceso / 4) * 2) {
                opacidadesPoligonosAcceso[data[i].gid] = 0.4;
            } else if (data[i].estacion > (maximoReportesporManzanaAcceso / 4) * 2 && data[i].estacion <= (maximoReportesporManzanaAcceso / 4) * 3) {
                opacidadesPoligonosAcceso[data[i].gid] = 0.7;
            } else {
                opacidadesPoligonosAcceso[data[i].gid] = 1;
            }
        }
        for (var i = 0; i < data.length; i++) {
            if (data[i].juego >= 0 && data[i].juego <= maximoReportesporManzanaJuegos / 4) {
                opacidadesPoligonosJuegos[data[i].gid] = 0.1;
            } else if (data[i].juego > maximoReportesporManzanaJuegos / 4 && data[i].juego <= (maximoReportesporManzanaJuegos / 4) * 2) {
                opacidadesPoligonosJuegos[data[i].gid] = 0.4;
            } else if (data[i].juego > (maximoReportesporManzanaJuegos / 4) * 2 && data[i].juego <= (maximoReportesporManzanaJuegos / 4) * 3) {
                opacidadesPoligonosJuegos[data[i].gid] = 0.7;
            } else {
                opacidadesPoligonosJuegos[data[i].gid] = 1;
            }
        }
        for (var i = 0; i < data.length; i++) {
            if (data[i].silla >= 0 && data[i].silla <= maximoReportesporManzanaSillas / 4) {
                opacidadesPoligonosSillas[data[i].gid] = 0.1;
            } else if (data[i].silla > maximoReportesporManzanaSillas / 4 && data[i].silla <= (maximoReportesporManzanaSillas / 4) * 2) {
                opacidadesPoligonosSillas[data[i].gid] = 0.4;
            } else if (data[i].silla > (maximoReportesporManzanaSillas / 4) * 2 && data[i].silla <= (maximoReportesporManzanaSillas / 4) * 3) {
                opacidadesPoligonosSillas[data[i].gid] = 0.7;
            } else {
                opacidadesPoligonosSillas[data[i].gid] = 1;
            }
        }
        for (var i = 0; i < data.length; i++) {
            if (data[i].luz >= 0 && data[i].luz <= maximoReportesporManzanaLuz / 4) {
                opacidadesPoligonosLuz[data[i].gid] = 0.1;
            } else if (data[i].luz > maximoReportesporManzanaLuz / 4 && data[i].luz <= (maximoReportesporManzanaLuz / 4) * 2) {
                opacidadesPoligonosLuz[data[i].gid] = 0.4;
            } else if (data[i].luz > (maximoReportesporManzanaLuz / 4) * 2 && data[i].luz <= (maximoReportesporManzanaLuz / 4) * 3) {
                opacidadesPoligonosLuz[data[i].gid] = 0.7;
            } else {
                opacidadesPoligonosLuz[data[i].gid] = 1;
            }
        }

        // me llama la función que asigna transparencia
        aplicarEstilo();

    }

    //función para crear estilo de cada poligono
    var aplicarEstilo = function () {
        for (each in capaConPoligonosCargados._layers) {
            var l = capaConPoligonosCargados._layers[each];
            var gid = l.feature.properties.gid;
            var opacidad = opacidadesPoligonos[gid];

            l.on('click', function () {
                //console.log(this);
                alerta_manzana = this.feature.properties.gid;
                alerta_policiaReportados = cantidadDePolicias[gid];
                alerta_arbolesReportados = cantidadDeArboles[gid];
                alerta_canecaReportados = cantidadDeCanecas[gid];
                alerta_estacionReportados = cantidadDeEstaciones[gid];
                alerta_juegoReportados = cantidadDeJuegos[gid];
                alerta_sillaReportados = cantidadDeSillas[gid];
                alerta_luzReportados = cantidadDeLuces[gid];
                var numero = this.feature.properties.gid;
                var manzana = "m" + numero;
                //console.log(manzana);
                manzanaSeleccionadacl = numero;
                $scope.cambiarSemanasSegunManzana();
                pc.highlight([eval(manzana)]);

            });
            l.on('mouseover', function (e) {
                 //this.openPopup();
                this.setStyle({
                    fillColor: '#0f0'
                });

                var numero = this.feature.properties.gid;
                var manzana = "m" + numero;

                //console.log(manzana);
                pc.highlight([eval(manzana)]);
                
                //console.log(capaConPoligonosCargadosPolicia._layers[165].feature.properties.gid);
                capaConPoligonosCargadosPolicia._layers[165].setStyle({
                    fillColor: '#0f0'
                });

            });
            l.on('mouseout', function (e) {
                // this.closePopup();
                this.setStyle({

                    fillColor: '#144a78',

                });
                pc.unhighlight([eval(manzana)]);


            });
            l.setStyle({
                fillColor: "#144a78",
                color: "#fff",
                fillOpacity: opacidad
            });
            l.bindPopup("<div id='popUpPoligono'><div id='elementosUsados'><div id='tituloPop'><span>Reportes:</span></div>" +
                "<div><img src='imagenes/iconos/iconoPolicia.png'><span>" + cantidadDePolicias[gid] + "</span></div>" +
                "<div><img src='imagenes/iconos/iconoArbol.png'><span>" + cantidadDeArboles[gid] + "</span></div>" +
                "<div><img src='imagenes/iconos/iconoCaneca.png'><span>" + cantidadDeCanecas[gid] + "</span></div>" +
                "<div><img src='imagenes/iconos/iconoEstacion.png'><span>" + cantidadDeEstaciones[gid] + "</span></div>" +
                "<div><img src='imagenes/iconos/iconoJuego.png'><span>" + cantidadDeJuegos[gid] + "</span></div>" +
                "<div><img src='imagenes/iconos/iconoSilla.png'><span>" + cantidadDeSillas[gid] + "</span></div>" +
                "<div><img src='imagenes/iconos/iconoLuz.png'><span>" + cantidadDeLuces[gid] + "</span></div></div><div class='divBotonEnviar'><a id='popupFormulario' onclick='crearFormulario()'>Crear Alerta</a></div></div>");

            if (pintarunavez == 1) {
                //                l.bindLabel(String(l.feature.properties.gid), {
                //                    noHide: true
                //                }).addTo(map);
                label = new L.Label()
                label.setContent(String(l.feature.properties.gid))
                label.setLatLng(capaConPoligonosCargados._layers[each].getBounds().getCenter())
                map.showLabel(label);

            }


        }
        pintarunavez = 0;
        for (each in capaConPoligonosCargadosPolicia._layers) {
            var l = capaConPoligonosCargadosPolicia._layers[each];
            var gid = l.feature.properties.gid;
            var opacidad = opacidadesPoligonosPolicia[gid];
            l.setStyle({
                fillOpacity: opacidad
            })


        }

        for (each in capaConPoligonosCargadosArboles._layers) {
            var l = capaConPoligonosCargadosArboles._layers[each];
            var gid = l.feature.properties.gid;
            var opacidad = opacidadesPoligonosArboles[gid];
            l.setStyle({
                fillOpacity: opacidad
            })

        }

        for (each in capaConPoligonosCargadosBasuras._layers) {
            var l = capaConPoligonosCargadosBasuras._layers[each];
            var gid = l.feature.properties.gid;
            var opacidad = opacidadesPoligonosBasuras[gid];
            l.setStyle({
                fillOpacity: opacidad
            })

        }

        for (each in capaConPoligonosCargadosAcceso._layers) {
            var l = capaConPoligonosCargadosAcceso._layers[each];
            var gid = l.feature.properties.gid;
            var opacidad = opacidadesPoligonosAcceso[gid];
            l.setStyle({
                fillOpacity: opacidad
            })

        }

        for (each in capaConPoligonosCargadosJuegos._layers) {
            var l = capaConPoligonosCargadosJuegos._layers[each];
            var gid = l.feature.properties.gid;
            var opacidad = opacidadesPoligonosJuegos[gid];
            l.setStyle({
                fillOpacity: opacidad
            })

        }

        for (each in capaConPoligonosCargadosSillas._layers) {
            var l = capaConPoligonosCargadosSillas._layers[each];
            var gid = l.feature.properties.gid;
            var opacidad = opacidadesPoligonosSillas[gid];
            l.setStyle({
                fillOpacity: opacidad
            })

        }

        for (each in capaConPoligonosCargadosLuz._layers) {
            var l = capaConPoligonosCargadosLuz._layers[each];
            var gid = l.feature.properties.gid;
            var opacidad = opacidadesPoligonosLuz[gid];
            l.setStyle({
                fillOpacity: opacidad
            })

        }


    }
    var temporal = {};
    var dibujarSemanas = function (data) {
        //console.log(data);

        for (var i = 0; i < data.length; i++) {
            opacidadesCuadrosPolicias[data[i].semananumero] = data[i].policias / 4;
            opacidadesCuadrosArboles[data[i].semananumero] = data[i].arbol / 4;
            opacidadesCuadrosBasuras[data[i].semananumero] = data[i].caneca / 4;
            opacidadesCuadrosAccesos[data[i].semananumero] = data[i].estacion / 4;
            opacidadesCuadrosJuegos[data[i].semananumero] = data[i].juego / 4;
            opacidadesCuadrosSillas[data[i].semananumero] = data[i].silla / 4;
            opacidadesCuadrosLuces[data[i].semananumero] = data[i].luz / 4;
        }
        console.log(datosCuadradosArboles);
        definirOpacidad(datosCuadradosPolicias, opacidadesCuadrosPolicias, opacidadesGuardadasPolicias);
        definirOpacidad(datosCuadradosArboles, opacidadesCuadrosArboles, opacidadesGuardadasArboles);
        definirOpacidad(datosCuadradosBasuras, opacidadesCuadrosBasuras, opacidadesGuardadasBasuras);
        definirOpacidad(datosCuadradosAccesos, opacidadesCuadrosAccesos, opacidadesGuardadasAccesos);
        definirOpacidad(datosCuadradosJuegos, opacidadesCuadrosJuegos, opacidadesGuardadasJuegos);
        definirOpacidad(datosCuadradosSillas, opacidadesCuadrosSillas, opacidadesGuardadasSillas);
        definirOpacidad(datosCuadradosLuces, opacidadesCuadrosLuces, opacidadesGuardadasLuces);
        crearCuadradosSemanas('#graficasemanas', 540, 20, '0070bb', 'policias', datosCuadradosPolicias);
        crearCuadradosSemanas('#graficasemanas', 540, 20, '30bb51', 'arboles', datosCuadradosArboles);
        crearCuadradosSemanas('#graficasemanas', 540, 20, 'bc6731', 'basuras', datosCuadradosBasuras);
        crearCuadradosSemanas('#graficasemanas', 540, 20, 'ffb92e', 'accesos', datosCuadradosAccesos);
        crearCuadradosSemanas('#graficasemanas', 540, 20, 'e31b20', 'juegos', datosCuadradosJuegos);
        crearCuadradosSemanas('#graficasemanas', 540, 20, '5a31bc', 'sillas', datosCuadradosSillas);
        crearCuadradosSemanas('#graficasemanas', 540, 20, 'dfdc13', 'luces', datosCuadradosLuces);

    }



    //HACER LLAMADOS AL SERVIDOR (EL CALLBACK ES LA FUNCI´ON QUE LLAMA CUANDO ME DEVUELVE EL SERVIDOR)
    $scope.filtrarManzanas = function () {
        if (!d3.event.sourceEvent) return;
        var extent0 = brush.extent(),
            extent1 = extent0.map(d3.time.day.round);

        if (extent1[0] >= extent1[1]) {
            extent1[0] = d3.time.day.floor(extent0[0]);
            extent1[1] = d3.time.day.ceil(extent0[1]);
        }

        d3.select(this).transition()
            .call(brush.extent(extent1))
            .call(brush.event);


        fechaInicial = brush.extent()[0];
        fechaFinal = brush.extent()[1];

        document.getElementById("desde").innerHTML = String(brush.extent()[0].getDate()) + " / " + String(brush.extent()[0].getMonth()) + " / " + String(brush.extent()[0].getFullYear());
        //para el formulario
        alerta_diaInicial = String(brush.extent()[0].getDate());
        alerta_mesInicial = String(brush.extent()[0].getMonth());
        alerta_anoInicial = String(brush.extent()[0].getFullYear());



        document.getElementById("hasta").innerHTML = String(brush.extent()[1].getDate()) + " / " + String(brush.extent()[1].getMonth()) + " / " + String(brush.extent()[1].getFullYear());
        //para el formulario
        alerta_diaFinal = String(brush.extent()[1].getDate());
        alerta_mesFinal = String(brush.extent()[1].getMonth());
        alerta_anoFinal = String(brush.extent()[1].getFullYear());

        fechaInicialGlobal = fechaInicial;
        fechaFinalGlobal = fechaFinal;


        map.removeLayer(capaConPoligonosCargados);
        map.removeLayer(capaConPuntosCargados);
        mapaPolicia.removeLayer(capaConPoligonosCargadosPolicia);
        mapaArboles.removeLayer(capaConPoligonosCargadosArboles);
        mapaBasuras.removeLayer(capaConPoligonosCargadosBasuras);
        mapaAcceso.removeLayer(capaConPoligonosCargadosAcceso);
        mapaJuegos.removeLayer(capaConPoligonosCargadosJuegos);
        mapaSillas.removeLayer(capaConPoligonosCargadosSillas);
        mapaLuz.removeLayer(capaConPoligonosCargadosLuz);

        coneccion.llamarFiltroManzanas({
            callback: dibujarMapa,
        });
        coneccion.llamarFiltroporHora({
            callback: dibujarPuntos,
        });

    }


    var manzanaSeleccionadacl = 0;
    // me llama los poligonos para dibujar
    coneccion.llamarFiltroManzanas({
        callback: dibujarMapa
    });

    coneccion.llamarFiltroporHora({
        callback: dibujarPuntos
    });

    coneccion.llamarOpacidadesSemana({
        callback: dibujarSemanas,
        manzanaSeleccionada: manzanaSeleccionadacl
    });


    $scope.cambiarSemanasSegunManzana = function () {
        console.log(manzanaSeleccionadacl);
        d3.selectAll("#graficasemanas svg").remove();
        opacidadesCuadrosPolicias = {};
        opacidadesGuardadasPolicias = [];
        opacidadesCuadrosPolicias = {};
        opacidadesGuardadasArboles = [];
        opacidadesCuadrosArboles = {};
        opacidadesGuardadasBasuras = [];
        opacidadesCuadrosBasuras = {};
        opacidadesGuardadasAccesos = [];
        opacidadesCuadrosAccesos = {};
        opacidadesGuardadasJuegos = [];
        opacidadesCuadrosJuegos = {};
        opacidadesGuardadasSillas = [];
        opacidadesCuadrosSillas = {};
        opacidadesGuardadasLuces = [];
        opacidadesCuadrosLuces = {};

        coneccion.llamarOpacidadesSemana({
            callback: dibujarSemanas,
            manzanaSeleccionada: manzanaSeleccionadacl

        });
    }


    //CREACION DEL MAPA DE GEOTABULA
    // llamar tiling de open street
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        osm = new L.TileLayer(osmUrl, {
            maxZoom: 16,
            attribution: osmAttrib,
        });

    // carga de tiling de open maps
    var map = L.map('mapEstado').setView([4.607230, -74.0692000], 16); // Posición inical del mapa (lat, long, zoom)
    map.addLayer(new L.TileLayer(osmUrl, {
        maxZoom: 18,
        opacity: .3,
    }));

    var mapaPolicia = L.map('mapaPolicia').setView([4.607038, -74.068819], 13.5); // Posición inical del mapa (lat, long, zoom)
    var mapaArboles = L.map('mapaArboles').setView([4.607038, -74.068819], 13.5); // Posición inical del mapa (lat, long, zoom)
    var mapaBasuras = L.map('mapaBasuras').setView([4.607038, -74.068819], 13.5); // Posición inical del mapa (lat, long, zoom)
    var mapaAcceso = L.map('mapaAcceso').setView([4.607038, -74.068819], 13.5); // Posición inical del mapa (lat, long, zoom)
    var mapaJuegos = L.map('mapaJuegos').setView([4.607038, -74.068819], 13.5); // Posición inical del mapa (lat, long, zoom)
    var mapaSillas = L.map('mapaSillas').setView([4.607038, -74.068819], 13.5); // Posición inical del mapa (lat, long, zoom)
    var mapaLuz = L.map('mapaLuz').setView([4.607038, -74.068819], 13.5); // Posición inical del mapa (lat, long, zoom)

    //configuración general del mapa
    map._layersMaxZoom = 18;
    map._layersMinZoom = 16;
    L.control.scale({
        position: 'bottomleft', // .. donde aparece
        imperial: false // .. sistema métrico
    }).addTo(map);

    mapaPolicia._layersMaxZoom = 14;
    mapaPolicia._layersMinZoom = 14;

    mapaArboles._layersMaxZoom = 14;
    mapaArboles._layersMinZoom = 14;

    mapaBasuras._layersMaxZoom = 14;
    mapaBasuras._layersMinZoom = 14;

    mapaAcceso._layersMaxZoom = 14;
    mapaAcceso._layersMinZoom = 14;

    mapaJuegos._layersMaxZoom = 14;
    mapaJuegos._layersMinZoom = 14;

    mapaSillas._layersMaxZoom = 14;
    mapaSillas._layersMinZoom = 14;

    mapaLuz._layersMaxZoom = 14;
    mapaLuz._layersMinZoom = 14;




    //CREACION DE LINEA DE TIEMPO PARA CONTROLAR
    var margin = {
            top: 0,
            right: 0,
            bottom: 20,
            left: 0
        },
        width = 930 - margin.left - margin.right,
        height = 70 - margin.top - margin.bottom;

    var x = d3.time.scale()
        .domain([new Date(2014, 12, 1), new Date(2016, 5, 1) - 1])
        .range([0, width]);

    var brush = d3.svg.brush()
        .x(x)
        .extent([new Date(2015, 1, 1), new Date(2016, 3, 1)])


    .on("brushend", $scope.filtrarManzanas);
    document.getElementById("desde").innerHTML = String(brush.extent()[0].getDate()) + " / " + String(brush.extent()[0].getMonth()) + " / " + String(brush.extent()[0].getFullYear());

    document.getElementById("hasta").innerHTML = String(brush.extent()[1].getDate()) + " / " + String(brush.extent()[1].getMonth()) + " / " + String(brush.extent()[1].getFullYear());

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



    function brushended() {
        console.log(extent0[0] + " y " + extent0[1]);
    }



            }]);