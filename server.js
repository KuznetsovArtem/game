var config = require('./config');
var express = require('express');
var app = express();

app.get('/', function(req, res){
    res.render('index.html');
});

app.use(express.static(__dirname + '/public'));

var server = app.listen(config.appPort, function() {
    console.log('Listening on port %d', server.address().port);
});