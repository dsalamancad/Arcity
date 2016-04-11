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
        //console.log(data.features[5].properties.id);

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
                layer.bindPopup(feature.properties.descripcio);
            }
        });
        capaConPuntosCargados.addTo(map);

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
    // Functions
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
    //    L.marker([4.606983, -74.068004]).bindLabel('Casa acal!', {
    //            noHide: true
    //        })
    //        .addTo(map);

    L.control.scale({ // Maneja la escala
        position: 'bottomleft', // .. donde aparece
        imperial: false // .. sistema métrico
    }).addTo(map);


    //    var deathIcon = L.icon({
    //        iconUrl: 'death.png',
    //        iconSize: [36, 36],
    //        iconAnchor: [18, 18],
    //        popupAnchor: [0, -18],
    //        labelAnchor: [14, 0] // as I want the label to appear 2px past the icon (18 + 2 - 6)
    //    });
    //    var noHide = false;
    //    L.marker([4.606983, -74.078004], {
    //            icon: deathIcon
    //        })
    //        .bindLabel('Erghhhhh..')
    //        .bindPopup('Can has popup?')
    //        .addTo(map)
    //        .on('click', function () {
    //            m.setLabelNoHide(noHide);
    //            noHide = !noHide;
    //        });





}]);