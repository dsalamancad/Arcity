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
        //console.log(params);

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
    //  borrar
    function onEachFeature(feature, layer) {
        // does this feature have a property named popupContent?
        if (feature.properties && feature.properties.gid) {
            layer.bindPopup(feature.properties.gid);
        }
    }
    var geojsonMarkerOptions = {
        "color": "#ff7800",
        "weight": 2,
        "opacity": 0.65
    };
    var dibujarMapa = function (data) {
        console.log(data);
        capaConPoligonosCargados = L.geoJson(data, {
            style: geojsonMarkerOptions
        });
        definirTransparencia(data);
        capaConPoligonosCargados.addTo(map);

    }

    var definirTransparencia = function (data) {
        for (var i = 0; i < data.length; i++) {
            guardaPoligonos.push(data[i].gid);
            var temporal=[];
            temporal.push(data[i].totale);


            guardaOpacidad.push(data[i].totale /60);
            //console.log(guardaPoligonos[i] + " tiene " + guardaOpacidad[i]);
        }

        var estiloCadaUno=function(a){
            switch(a.properties.gid){
                case guardaPoligonos[0]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[0]};
                case guardaPoligonos[1]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[1]};
                case guardaPoligonos[2]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[2]};
                case guardaPoligonos[3]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[3]};
                case guardaPoligonos[4]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[4]};
                case guardaPoligonos[5]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[5]};
                case guardaPoligonos[6]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[6]};
                case guardaPoligonos[7]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[7]};
                case guardaPoligonos[8]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[8]};
                case guardaPoligonos[9]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[9]};
                case guardaPoligonos[10]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[10]};
                case guardaPoligonos[11]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[11]};
                case guardaPoligonos[12]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[12]};
                case guardaPoligonos[13]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[13]};
                case guardaPoligonos[14]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[14]};
                case guardaPoligonos[15]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[15]};
                case guardaPoligonos[16]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[16]};
                case guardaPoligonos[17]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[17]};
                case guardaPoligonos[18]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[18]};
                case guardaPoligonos[19]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[19]};
                case guardaPoligonos[20]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[20]};
                case guardaPoligonos[21]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[21]};
                case guardaPoligonos[22]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[22]};
                case guardaPoligonos[23]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[23]};
                case guardaPoligonos[24]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[24]};
                case guardaPoligonos[25]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[25]};
                case guardaPoligonos[26]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[26]};
                case guardaPoligonos[27]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[27]};
                case guardaPoligonos[28]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[28]};
                case guardaPoligonos[29]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[29]};
                case guardaPoligonos[30]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[30]};
                case guardaPoligonos[31]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[31]};
                case guardaPoligonos[32]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[32]};
                case guardaPoligonos[33]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[33]};
                case guardaPoligonos[34]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[34]};
                case guardaPoligonos[35]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[35]};
                case guardaPoligonos[36]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[36]};
                case guardaPoligonos[37]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[37]};
                case guardaPoligonos[38]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[38]};
                case guardaPoligonos[39]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[39]};
                case guardaPoligonos[40]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[40]};
                case guardaPoligonos[41]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[41]};
                case guardaPoligonos[42]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[42]};
                case guardaPoligonos[43]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[43]};
                case guardaPoligonos[44]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[44]};
                case guardaPoligonos[45]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[45]};
                case guardaPoligonos[46]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[46]};
                case guardaPoligonos[47]:return{color:"#144a78",weight: 1,fillOpacity:guardaOpacidad[47]};

            }
        };
        capaConPoligonosCargados = L.geoJson(data, {
            style: estiloCadaUno
        });
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
    coneccion.llamarFiltroReportesPorManzanas({
        callback: definirTransparencia,
        horaInicial: 0,
        horaFinal: 24
    });
    coneccion.llamarFiltroManzanas({
        callback: dibujarMapa,
        horaInicial: 0,
        horaFinal: 24
    });



    // ------------------------------------------------------
    // Functions mapa de geotabula
    // ------------------------------------------------------
    var transparencia = {
        opacity: 0.2
    };
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        osm = new L.TileLayer(osmUrl, {
            maxZoom: 18,
            attribution: osmAttrib,

        });




    var map = L.map('mapEstado').setView([4.607038, -74.068819], 16); // Posición inical del mapa (lat, long, zoom)
    map.addLayer(new L.TileLayer(osmUrl, {
        maxZoom: 18,
        attribution: osmAttrib,
        opacity:.3,

    })); // El mapa base que se va a utilizar (debe importarse la librería correspondiente en index.html)
    map._layersMaxZoom = 18; // Definie el máximo zoom del mapa
    map._layersMinZoom = 10;
    L.control.scale({ // Maneja la escala
        position: 'bottomleft', // .. donde aparece
        imperial: false // .. sistema métrico
    }).addTo(map);




}]);
