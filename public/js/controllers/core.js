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
    var dibujarMapa = function (data) {
        //console.log(data);
        capaConPuntosCargados = L.geoJson(data);
        capaConPuntosCargados.addTo(map);




        var w = 800;
        var h = 450;
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


        console.log(data);
        console.log(data.features[0].properties.hora);
        var svg = d3.select("body").append("svg")
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
                console.log(date);
                return x(date);
            })
            .attr("cy", 20)




    }

    $scope.filtrarPorValor = function () {
        d3.selectAll("svg").remove();
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


    var map = L.map('map').setView([4.605038, -74.069819], 16); // Posición inical del mapa (lat, long, zoom)    
    map.addLayer(new L.TileLayer.provider('Esri.WorldGrayCanvas')); // El mapa base que se va a utilizar (debe importarse la librería correspondiente en index.html)   
    map._layersMaxZoom = 16; // Definie el máximo zoom del mapa
    map._layersMinZoom = 10;

    L.control.scale({ // Maneja la escala
        position: 'bottomleft', // .. donde aparece
        imperial: false // .. sistema métrico
    }).addTo(map);








}]);