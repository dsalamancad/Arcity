// ------------------------------------------------------
// Imports
// ------------------------------------------------------
// Create express application
var express = require('express');
var app = express();
var puerto = process.env.PORT || 5000;

// Serving static files (http://expressjs.com/starter/static-files.html)
app.use(express.static(__dirname + '/public'));
// Routing for express (http://expressjs.com/guide/routing.html)
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

// Start app and listen on port 3000 for connections
var server = app.listen(puerto, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});



var io = require('socket.io')(server); // WebSockets handling
var geo = require('geotabuladb'); // Database operation


// ------------------------------------------------------
// Script --> Initialización de geotabulaDB
// ------------------------------------------------------
//geo.setCredentials({
//    type : 'postgis',
//    host : 'ec2-23-21-157-223.compute-1.amazonaws.com',
//    user : 'xkwcdmnylucjhr',
//    password : 'c4GzMJFgx9tkeNnhy5tAdjjsXY',
//    database : 'd5h2irs74tlg5e'
//});

geo.setCredentials({
    type: 'postgis',
    host: 'localhost',
    user: 'geotabula',
    password: 'geotabula',
    database: 'geotabula'
});




// ------------------------------------------------------
// Event Management
// ------------------------------------------------------
// When socket.io receives a connection...
io.on('connection', function (socket) {
    socket.on("filtrarHora", function (params) {
        consultarMapaFiltrado(params, function (geojson) {
            socket.emit("mapaFiltrado", {
                guid: params.caller,
                geojson: geojson
            });
        })
    })
    socket.on("llamarManzanas", function (params) {
         console.log("llamado 2");
        consultarManzanasEnDB(params, function (geojson) {
            socket.emit("manzanasFiltradas", {
                guid: params.caller,
                geojson: geojson
            });
        })
    })
    socket.on("llamarReportesPorManzanas", function (params) {
        consultarReportesenManzanasEnDB(params, function (geojson) {
            socket.emit("reportesPorManzanasFiltradas", {
                guid: params.caller,
                geojson: geojson
            });
        })
    })
    socket.on('error', function (exception) {
        console.log(exception);
    })
});



function consultarMapaFiltrado(params, callback) {
    geo.geoQuery({
            tableName: 'reportes', // The name of the table we are going to query
            geometry: 'geom', // The name of the column who has the geometry
            //where: 'EXTRACT(HOUR FROM hora)>=' + params.horaInicial + 'AND EXTRACT(HOUR FROM hora)<=' + params.horaFinal,
            properties: ['id', 'usuario', 'fecha', 'descripcio', 'seguidores', 'respondido']

            //querystring: "lo que busco en web";
        },



        function (json) {
            callback(json);
        });
    //querystring
    // tengo calles, tengo puntos, los puntos so n la entrada. En cada calle haga bufer de 50 mts, si dentro de ese buffer, estan los puntos que me enetraron, devuelvamela

}

function consultarManzanasEnDB(params, callback) {
     console.log("llamado 3");
    geo.geoQuery({
            tableName: 'manzanasbarriolasnieves', // The name of the table we are going to query
            geometry: 'geom', // The name of the column who has the geometry
            //where: 'EXTRACT(HOUR FROM hora)>=' + params.horaInicial + 'AND EXTRACT(HOUR FROM hora)<=' + params.horaFinal,
            properties: ['gid']

            //querystring: "lo que busco en web";
        },
        function (json) {
            callback(json);
        });


}

function consultarReportesenManzanasEnDB(params, callback) {
    console.log("inicial: "+ params.diaInicial+"/"+ params.mesInicial+"/"+ params.anoInicial);
    console.log("final: "+ params.diaFinal+"/"+ params.mesFinal+"/"+ params.anoFinal);
    console.log(params);
    geo.query({
            querystring: "SELECT manzanasbarriolasnieves.gid as gid,count(reportes.geom) AS totale,sum(reportes.policia) as policias,sum(reportes.caneca) as caneca,sum(reportes.silla) as silla,sum(reportes.estacion) as estacion,sum(reportes.juego) as juego,sum(reportes.arbol) as arbol,sum(reportes.luz) as luz FROM public.manzanasbarriolasnieves LEFT JOIN public.reportes ON st_contains(manzanasbarriolasnieves.geom,reportes.geom) AND reportes.fecha <='"+params.fechaFinal+"'::date AND reportes.fecha>='"+params.fechaInicial+"'::date GROUP BY manzanasbarriolasnieves.gid ORDER BY manzanasbarriolasnieves.gid"


        },
        function (json) {
           //console.log(json);
            callback(json);
        });

}
