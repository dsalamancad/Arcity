var my_angular_app = angular.module('my_angular_app', []);

my_angular_app.service("coneccion", function () {
    //este servicio lo uso para comunicarme con el servidor. Aca va todos los sockets.
    var socket = io();
    //tiene el uid y el metodo
    var callbacksMapa = {};

    socket.on("manzanasFiltradas", function (params) {
        //llamar el callback que tien el guid y le paso como parametro el geojson
        callbacksMapa[params.guid](params.geojson);
        delete callbacksMapa[params.guid];
    });

    socket.on("reportesPorManzanasFiltradas", function (params) {
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
    var capaConPoligonosCargados;
    var capaConPoligonosMulticoloresCargados;
    var guardaPoligonos = [];
    var guardaOpacidad = [];
    var opacidadesPoligonos = {};
    var geojsonMarkerOptions = {
        "color": "#ff7800",
        "weight": 2,
        "opacity": 0.65
    };

    // FUNCIONES LLAMADAS CUANDO VUEVLE EL MENSAJE DEL SERVIDOR
    var dibujarMapa = function (data) {
        //console.log(data);
        capaConPoligonosCargados = L.geoJson(data, {
            style: geojsonMarkerOptions
        });
        // me llama los reportes por poligono
        coneccion.llamarFiltroReportesPorManzanas({
            callback: definirTransparencia,
            horaInicial: 0,
            horaFinal: 24
        });
        capaConPoligonosCargados.addTo(map);
    }

    //función para meter en arrays los valores de poligono y su numero de reportes
    var definirTransparencia = function (data) {
        var maximoReportesporManzana = d3.max(data, function (d) {
            return Number(d.totale);
        });

        for (var i = 0; i < data.length; i++) {
            opacidadesPoligonos[data[i].gid] = data[i].totale / maximoReportesporManzana;
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
            l.setStyle({
                color: "#144a78",
                fillOpacity: opacidad
            })

        }
    }


    //HACER LLAMADOS AL SERVIDOR (EL CALLBACK ES LA FUNCI´ON QUE LLAMA CUANDO ME DEVUELVE EL SERVIDOR)
    // la usaré cuando sea filtrar por el timeline
    $scope.filtrarManzanas = function () {
        //d3.selectAll("#capad3Hora svg").remove();
        //map.removeLayer(capaConPuntosCargados);
        coneccion.llamarFiltroManzanas({
            callback: dibujarMapa,
            horaInicial: $scope.horaInicialFiltro,
            horaFinal: $scope.horaFinalFiltro
        });
    }

    // me llama los poligonos para dibujar
    coneccion.llamarFiltroManzanas({
        callback: dibujarMapa,
        horaInicial: 0,
        horaFinal: 24
    });


    //CREACION DEL MAPA DE GEOTABULA-----------------------------------------------------
    // llamar tiling de open street
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        osm = new L.TileLayer(osmUrl, {
            maxZoom: 18,
            attribution: osmAttrib,
        });

    // carga de tiling de open maps
    var map = L.map('mapEstado').setView([4.607038, -74.068819], 16); // Posición inical del mapa (lat, long, zoom)
    map.addLayer(new L.TileLayer(osmUrl, {
        maxZoom: 18,
        attribution: osmAttrib,
        opacity: .3,
    }));

    //configuración general del mapa
    map._layersMaxZoom = 18;
    map._layersMinZoom = 10;
    L.control.scale({
        position: 'bottomleft', // .. donde aparece
        imperial: false // .. sistema métrico
    }).addTo(map);
}]);
