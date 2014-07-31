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

// load a map
app.post('/map/load/:name?', function(req, res) {
    var mapName = req.param('name');

    var sheets = fs.readFileSync(config.editor.savedSheetsDir + mapName, 'utf8');

    fs.readFile(config.editor.savedMapsDir + mapName, 'utf8', function(err, mapData) {
        if (err) throw err;
        res.send({
            map: JSON.parse(mapData),
            sheet: JSON.parse(sheets)
        })
    })
});

// save map
app.post('/map/save/:name?', function(req, res) {

    var fileName = req.param('name') + '.json'; // TODO: check file

    fs.writeFile(config.editor.savedMapsDir + fileName, JSON.stringify(req.body.map, null, 4), function(err) {
        if(err) throw  err
        console.log("map saved to " + fileName);
    })
    fs.writeFile(config.editor.savedSheetsDir + fileName, JSON.stringify(req.body.frames, null, 4), function(err) {
        if (err) throw  err
        console.log("texture spriteSheet saved to " + fileName);
    })
    fs.writeFile(config.editor.savedMapConfsDir + fileName, JSON.stringify(req.body.config, null, 2), function(err) {
        if(err) throw  err
        console.log("map config saved to " + fileName);
    })
    res.send('saved');
});

app.post('/map/saveimage/:name?', function(req, res) {
    var fileName = req.param('name') + '.png'; // TODO: check file
    var base64Data = req.body.img.replace(/^data:image\/png;base64,/, "");
    binaryData = new Buffer(base64Data, 'base64').toString('binary');

//    fs.writeFile(config.editor.savedSheetsDir + fileName, base64Data, 'base64', function(err) {
    fs.writeFile(config.editor.savedSheetsDir + fileName, binaryData, 'binary', function(err) {
        if(err) throw err;
        console.log('Img saved to ' + fileName);
        console.log(req.body);
        res.send('Image saved');
    });
});

var server = app.listen(config.appPort, function() {
    console.log('Listening on port %d', server.address().port);
});