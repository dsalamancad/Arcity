// ------------------------------------------------------
// Imports
// ------------------------------------------------------
// Create express application
var express = require('express');
var app = express();
var port = process.env.PORT || 5000;

// Serving static files (http://expressjs.com/starter/static-files.html)
app.use(express.static(__dirname + '/public'));
// Routing for express (http://expressjs.com/guide/routing.html)
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

// Start app and listen on port 3000 for connections
var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});



var io = require('socket.io')(server); // WebSockets handling
var geo = require('geotabuladb'); // Database operation


// ------------------------------------------------------
// Script --> Initialización de geotabulaDB
// ------------------------------------------------------
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
});



function consultarMapaFiltrado(params, callback) {
    geo.geoQuery({
            tableName: 'universidades', // The name of the table we are going to query
            geometry: 'geom', // The name of the column who has the geometry
            where: 'EXTRACT(HOUR FROM hora)>=' + params.horaInicial + 'AND EXTRACT(HOUR FROM hora)<=' + params.horaFinal,
            properties: ['nombre', 'telefono','hora']
        },
        function (json) {
            callback(json); 
        });


}
