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

    //generar identificadores únicos con el objetivo de poder identificar quien está haciendo el llamado. 
    var genGuid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };
    //este es mi metodod que voy a usar 
    var llamarFiltroManzanas = function (params) {
        //console.log(params);

        var guid = genGuid();
        callbacksMapa[guid] = params.callback;
        params["caller"] = guid;
        socket.emit("llamarManzanas", params);


    }

    return {
        llamarFiltroManzanas: llamarFiltroManzanas,

    };
})

my_angular_app.controller("home_controller", ["$scope", "coneccion", function ($scope, coneccion) {
    //console.log($scope);
    var socket = io();
    var capaConPuntosCargados;

    //  borrar  
    function onEachFeature(feature, layer) {
        // does this feature have a property named popupContent?
        if (feature.properties && feature.properties.gid) {
            layer.bindPopup(feature.properties.gid);
        }
    }
    var geojsonMarkerOptions = {
        fillColor: "#ff0",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };
    var dibujarMapa = function (data) {
        console.log(data);
        //console.log(data.features[5].properties.id);

        //Creación del mapa de leaflet SIN DC
        capaConPuntosCargados = L.geoJson(data, {

            style: function (feature) {
                return {
                    radius: (feature.properties.id) / 8
                };
            },
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, geojsonMarkerOptions);
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties.gid);
            }
        });
        capaConPuntosCargados.addTo(map);

    }


    $scope.filtrarManzanas = function () {
        //d3.selectAll("#capad3Hora svg").remove();
        //map.removeLayer(capaConPuntosCargados);
        coneccion.llamarFiltroManzanas({
            callback: dibujarMapa,
            horaInicial: $scope.horaInicialFiltro,
            horaFinal: $scope.horaFinalFiltro
        });
    }
    coneccion.llamarFiltroManzanas({
        callback: dibujarMapa,
        horaInicial: 0,
        horaFinal: 24
    });

    // ------------------------------------------------------
    // Functions mapa de geotabula 
    // ------------------------------------------------------
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        osm = new L.TileLayer(osmUrl, {
            maxZoom: 18,
            attribution: osmAttrib
        });




    var map = L.map('map').setView([4.607038, -74.068819], 16); // Posición inical del mapa (lat, long, zoom)    
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




}]);