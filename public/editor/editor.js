/**
 * Created by askuznetsov on 7/22/2014.
 */
var mapObject;

var constuct =  function(map) {

    // configs
    var conf = {
        W: 800,
        H: 800,
        antialising: false
    };

    // init
    // var camera = new PIXI.Stage(0xAABBCC);
    var mapStage = new PIXI.Stage('', true); // interactive
    var spriteStage = new PIXI.Stage('', true);

    // var stage = new PIXI.DisplayObjectContainer();

    var renderer = PIXI.autoDetectRenderer(conf.W, conf.H, null, true);
    document.getElementById('map-editor').appendChild(renderer.view);
    // document.body.appendChild(renderer.view);
    var sheetRenderer = PIXI.autoDetectRenderer(160, 160, null, true);
    document.getElementById('sprite-sheet').appendChild(sheetRenderer.view);


    var mapTerrainLayer = new PIXI.DisplayObjectContainer();
    mapStage.addChild(mapTerrainLayer);

    var mapWidth = map.terrain.length;
    var mapHeight = map.terrain[0].length;
    for(var i = 0; i < mapWidth; i++) {
        for(var j = 0; j < mapHeight; j++) {
            var graphic = new PIXI.Graphics();
            graphic.lineStyle(1, 0xfafafa);
            graphic.drawRect(i * map.tileW, j * map.tileH, map.tileW, map.tileH);
            mapTerrainLayer.addChild(graphic);
        }
    }

    var texture = PIXI.Texture.fromImage("/editor/tiles/etst/t1.png");
    // create a new Sprite using the texture
    var tile = new PIXI.Sprite(texture);
    // center the sprites anchor point
    tile.anchor.x = 0.5;
    tile.anchor.y = 0.5;
    // move the sprite to the center of the screen
    tile.position.x = 200;
    tile.position.y = 150;
    tile.interactive = true

    tile.mousedown = function(data) {
        console.log('click', data)
        tile.mousemove = function(e) {
            console.log('move', e)
            tile.position.x = e.originalEvent.x - 320;
            tile.position.y = e.originalEvent.y - 40;
        }
        tile.mouseup = function() {
            tile.mousemove = function() {}
        }
    }

    mapStage.addChild(tile);


    requestAnimFrame(animate);

    function animate() {
        requestAnimFrame(animate);

        renderer.render(mapStage);
        sheetRenderer.render(spriteStage);
    }

    mapObject = map;
}


/**
 *
 */
var mapFx = (function() {
    return {
        generateEmptyLayer: function (w, h) {
            var layer = [];
            for(var i = 0; i < w; i++) {
                layer[i] = []
                for(var j = 0; j < h; j++) {
                    layer[i][j] = 0;
                }
            }
            return layer;
        }
    }
})();

/**
 *
 */
function createMap() {
    var size = {
        x: parseInt($('#map-width').val()),
        y: parseInt($('#map-height').val())
    }
    var map = {
        "name": $('#map-name').val(),
        "version": "0.0.1",
        "tileH": 32,
        "tileW": 32,
        "terrain": mapFx.generateEmptyLayer(size.x, size.y),
        "decor":   mapFx.generateEmptyLayer(size.x, size.y),
        "items":   mapFx.generateEmptyLayer(size.x, size.y),
        "textures": {
        }
    }
    constuct(map);
}

function saveMap() {
    console.log('try to save');
//    $.get('/map/' + mapObject.name, function(data) {
//        console.log(data);
//    });

    var data = {
        map: mapObject,
        textures: '' // TODO;
    }

    $.ajax({
        url: '/map/' + mapObject.name,
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        async: false,
        success: function(msg) {
            console.log(data);
        }
    })

}
