var config = require('./config');
var proccess = require('child_process');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var cons = require('consolidate');

var app = express();

var mapWorker = proccess.fork('server/child.js', ['map-worker']);

mapWorker.send({
    msg: 'message',
    data: []
});
mapWorker.on("message", function(data) {
    console.log('Ansver:', data);
});
mapWorker.on('close', function (code, signal) {
    console.log('child process terminated due to receipt of signal '+signal);
});




app.use(express.static(__dirname + '/public'));
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded() );
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/map_editor');
// TODO: Move to dev config
app.set('view cache', false);
// To disable Swig's cache, do the following:
// cons.swig.setDefaults({ cache: false }); FIX: https://github.com/backflip/consolidate.js/blob/master/lib/consolidate.js#L247



app.get('/', function(req, res){
    res.sendfile('public/index.html');
});

app.get('/editor', function(req, res) {

    /**
     * Returns array of dirs
     * @param parentDir
     * @returns {*}
     */
    function getDirectories(parentDir) {
        return fs.readdirSync(parentDir).filter(function (file) {
            return fs.statSync(parentDir + file).isDirectory();
        });
    }

    /**
     * returns obj w/ dirs as key and img mames in arrey as val
     * @param dirs Array
     */
    function getAllTiles(dirs, parent) {
        var tiles = {};
        for(var i = 0; i < dirs.length; i++) {
            var curDir = parent + dirs[i] + '/';
            tiles[dirs[i]] = fs.readdirSync(curDir).filter(function (file) {
                return fs.statSync(curDir + file).isFile()
            });
        }

        return tiles;
    }

    var tilesDir = __dirname + '/public/editor/tiles/';
    var dirs = getDirectories(tilesDir);
    var tiles = getAllTiles(dirs, tilesDir);

    var locals = {
        header: '[MAP-block]',
        column: '[ELEMENTS-block]',
        tilesDir: 'editor/tiles/',
        tiles: tiles
    }

    res.render('editor', {
        local: locals
    });
});

app.post('/map/:name?', function(req, res) {

    var editorDir = 'map_editor/maps/';

    var map = req.body.map;

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

    fs.writeFile(editorDir + fileName, JSON.stringify(map, null, 4), function(err) {
        if(err) {
            console.log(err)
        } else {
            console.log("map saved to " + editorDir + fileName);
        }
    })
    res.send('saved');
});


var server = app.listen(config.appPort, function() {
    console.log('Listening on port %d', server.address().port);
});