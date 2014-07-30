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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.set('views', __dirname + '/editor');
// TODO: Move to dev config
app.set('view cache', false);
// To disable Swig's cache, do the following:
// cons.swig.setDefaults({ cache: false }); FIX: https://github.com/backflip/consolidate.js/blob/master/lib/consolidate.js#L247


// GAME
app.get('/', function(req, res){
    res.sendfile('public/index.html');
});


// editor
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
     * return array of files
     * @param dir
     */
    function getFiles(dir) {
        return fs.readdirSync(dir).filter(function(file) {
            return fs.statSync(dir + file).isFile();
        });
    }

    /**
     * returns obj w/ dirs as key and img mames in arrey as val
     * @param dirs Array
     */
    function getAllTiles(tilesDir) {
        var dirs = getDirectories(tilesDir);
        var tiles = {};
        for(var i in dirs) {
            tiles[dirs[i]] = getFiles(tilesDir + dirs[i] + '/');
        }
        return tiles;
    }

    var locals = {
        header: '[MAP-block]',
        column: '[ELEMENTS-block]',
        tilesDir: 'editor/tiles/',
        tiles: getAllTiles(config.editor.tilesDir),
        savedMaps: getFiles(config.editor.savedMapsDir)
    }

    res.render('editor', {
        local: locals
    });
});

app.post('/map/:name?', function(req, res) {

    var map = req.body.map;
    var frames = req.body.frames;

    var fileName = req.param('name'); // TODO: check file

    // TODO: move to load logic
//    if(fs.existsSync(editorDir + fileName)) {
//        return fs.readFile(editorDir + fileName, function(err, data) {
//            if(err) {
//                throw err;
//            }
//            console.log(data);
//            res.send(data);
//        });
//    }

    fs.writeFile(config.editor.savedMapsDir + fileName + '.json', JSON.stringify(map, null, 4), function(err) {
        if(err) {
            console.log(err)
        } else {
            console.log("map saved to " + fileName);
        }
    })
    fs.writeFile(config.editor.savedSheetsDir + fileName + '.json', JSON.stringify(frames, null, 4), function(err) {
        if(err) {
            console.log(err)
        } else {
            console.log("texture spriteSheet saved to " + fileName);
        }
    })
    res.send('saved');
});

var server = app.listen(config.appPort, function() {
    console.log('Listening on port %d', server.address().port);
});