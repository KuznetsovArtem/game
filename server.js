var config = require('./config');
var express = require('express');
var fs = require('fs');

var app = express();

app.get('/', function(req, res){
    res.sendfile('public/index.html');
});

app.get('/editor', function(req, res) {
    res.sendfile('map_editor/editor.html');
});

app.get('/map/:name?', function(req, res) {

    var editorDir = 'map_editor/maps/';

    var testData = {
        a : 1,
        b : 2
    };

    var fileName = req.param('name')||'l2.json';

    if(fs.existsSync(editorDir + fileName)) {
        return fs.readFile(editorDir + fileName, function(err, data) {
            if(err) {
                throw err;
            }
            console.log(data);
            res.send(data);
        })
    }

    fs.writeFile(editorDir + fileName, JSON.stringify(testData, null, 4), function(err) {
        if(err) {
            console.log(err)
        } else {
            console.log("map saved to " + editorDir + fileName);
        }
    })
    res.send('saved');
})

app.use(express.static(__dirname + '/public'));

var server = app.listen(config.appPort, function() {
    console.log('Listening on port %d', server.address().port);
});