/**
 * Created by askuznetsov on 7/22/2014.
 */
var mapObject;

var constuct =  function(map) {

    // configs
    var conf = {
        W: 800,
        H: 800,
        antialising: false,
        sMap : {
            W: 160,
            H: 160,
            tile: {
                W: 32,
                H: 32
            }
        }
    };
    // Map and spriteSheet
    var mapStage = new PIXI.Stage('', true); // interactive
    var spriteStage = new PIXI.Stage('', true);

    var renderer = PIXI.autoDetectRenderer(conf.W, conf.H, null, true);
    document.getElementById('map-editor').appendChild(renderer.view);

    var sheetRenderer = PIXI.autoDetectRenderer(conf.sMap.W, conf.sMap.W, null, true);
    document.getElementById('sprite-sheet').appendChild(sheetRenderer.view);

    // Terrain itit
    var mapTerrainLayer = new PIXI.DisplayObjectContainer();
    mapStage.addChild(mapTerrainLayer);
    window.terrain = mapTerrainLayer;
    // init zoom for tarrain lalyer
    mapFx.zoom(mapTerrainLayer);

    // Grid for clearance
    mapFx.drawGrid(map.terrain.length, map.terrain[0].length, map, mapTerrainLayer);

/* // Tile test
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
        // dragging
//        tile.mousemove = function(e) {
//            console.log('move', e)
//            tile.position.x = e.originalEvent.x - 320;
//            tile.position.y = e.originalEvent.y - 40;
//        }
        tile.mouseup = function() {
            tile.mousemove = function() {}
        }
    }
    mapStage.addChild(tile);
*/

    /**
     * map keybord movement
     */
    function moveMap(obj, direction) {
        // TODO: now def speed is 0.1 + move to conf
        var offset = 50;
        var speed = 2;
        obj.position.x += Math.cos(direction) * speed;
        obj.position.y += Math.sin(direction) * speed;
    }

    var stageMove = {
        moveUp: function () {
            moveMap(mapTerrainLayer, -1 * Math.PI / 2);
        },
        moveDown: function () {
            moveMap(mapTerrainLayer, Math.PI / 2);
        },
        moveLeft: function () {
            moveMap(mapTerrainLayer, -1 * Math.PI);
        },
        moveRight: function () {
            moveMap(mapTerrainLayer, 2 * Math.PI);
        }
    }
    // map move
    kd.UP.down(stageMove.moveUp);
    kd.DOWN.down(stageMove.moveDown);
    kd.LEFT.down(stageMove.moveLeft);
    kd.RIGHT.down(stageMove.moveRight);

    // init brush
    brush.init(spriteStage, conf.sMap);

    requestAnimFrame(animate);

    function animate() {
        requestAnimFrame(animate);

        kd.tick();
        renderer.render(mapStage);
        sheetRenderer.render(spriteStage);
    }

    mapObject = map;
}

/**
 *
 */
var mapFx = (function() {
    fx = {
        makeSquere: function(map) {
            var graphic = new PIXI.Graphics();
            graphic.lineStyle(1, 0xfafafa);
            graphic.drawRect(0, 0, map.tileW, map.tileH);
            graphic.boundsPadding = 0;
            return graphic;
        },
        zoomLayer: ''
    }

    function MapTerSprite(index, sprite) {
        this.index = {
            x: index.x||0,
            y: index.y||0
        };

        var parent = this;
        this.sprite = sprite||'';
        this.sprite.self = parent;
    }
    MapTerSprite.prototype.getIndex = function() {
        return this.index;
    }

    return {
        zoom : function(obj) {
            var layer = fx.zoomLayer;
            if(obj) {
                fx.zoomLayer  = obj;
                return ;
            } else {
                return {
                    in: function() {
                        layer.scale.x += 0.5
                        layer.scale.y += 0.5
                    },
                    out: function() {
                        layer.scale.x -= 0.5
                        layer.scale.y -= 0.5
                    }
                }
            }
        },
        generateEmptyLayer: function (w, h) {
            var layer = [];
            for(var i = 0; i < w; i++) {
                layer[i] = []
                for(var j = 0; j < h; j++) {
                    layer[i][j] = 0;
                }
            }
            return layer;
        },
        drawGrid: function(mapWidth, mapHeight, map, mapLayer) {
            var terrain = [];
            for(var i = 0; i < mapWidth; i++) {
                terrain[i] = [];
                for(var j = 0; j < mapHeight; j++) {
                    terrain[i][j] = new MapTerSprite({
                        x: i,
                        y: j
                    }, new PIXI.Sprite(fx.makeSquere(map).generateTexture()));
                    var sprite = terrain[i][j].sprite;
                    sprite.position.x = i * map.tileW;
                    sprite.position.y = j * map.tileH;
                    sprite.anchor.x = 0;
                    sprite.anchor.y = 0;
                    sprite.interactive = true
                    sprite.mousedown = function(e) {
//                        console.log(this, "clicked on sprite", e);
                        brush.editTile(this.self.index);
//                        console.log("clicked on sprite", e);
                        var brushTexture = brush.get()||"/editor/tiles/etst/t1.png"
                        this.texture = PIXI.Texture.fromImage(brushTexture);
                    }
                    sprite.mouseover = function(e) {
                        if(e.originalEvent.ctrlKey) {
                            brush.editTile(this.self.index);
                            var brushTexture = brush.get()||"/editor/tiles/etst/t1.png"
                            this.texture = PIXI.Texture.fromImage(brushTexture);
                            console.log("drawing..");
                        }
                    }
                    mapLayer.addChild(sprite);
                }
            }
            //
        }
    }
})();

/**
 *
 */
function createMap(p) {
    p = p||{}
    var size = {
        x: p.x||parseInt($('#map-width').val()),
        y: p.y||parseInt($('#map-height').val())
    }
    var map = {
        "name": p.name||$('#map-name').val(),
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

    var data = {
        map: mapObject,
        frames : mapFrames.getFrames()
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

var brush = (function() {
    var canvas, config, currentBrush,
        textures = [];

    function addSprite(imgUrl) {
        // create tile for spriteMap
        var tile = new PIXI.Sprite(PIXI.Texture.fromImage(imgUrl));
        tile.position.x = textures.length % config.sizeX * config.tile.H||0;
        tile.position.y = Math.floor(textures.length / config.sizeX) * config.tile.W;
        tile.interactive = true;
        // TODO: select brush from spriteMap
        tile.mousedown = function(e) {
            console.log(e, this);
        }

        var name = imgUrl.split('/');
        name = name[name.length - 1];
        textures.push(name);
        mapFrames.add(name, {
            x: tile.position.x,
            y: tile.position.y
        });
        canvas.addChild(tile);
    }

    return {
        init : function(canv, canvConfig) {
            canvas = canv;
            config = canvConfig;
            config.sizeX = canvConfig.W / canvConfig.tile.W;
            config.sizeY = canvConfig.H / canvConfig.tile.H;
        },
        set : function(pic) {
            currentBrush = pic;
            if(!frames[pic] ) {
                addSprite(pic);
            }
        },
        get : function() {
            return currentBrush;
        },
        getTextures : function() {
            return textures;
        },
        editTile : function(pos) {
            var name = currentBrush.split('/');
            name = name[name.length - 1];
            mapObject.terrain[pos.x][pos.y] = textures.indexOf(name);
            console.log('SET TO: '+ textures.indexOf(name));
        }
    }
})();

var mapFrames = (function() {
    var frames = {};

    function generateFrameFile() {
        var framesJson = {
            frames: frames,
            meta : {
                app: "game",
                version: "0.1",
                image : '', // [mapname].png
                format: "RGBA8888",
                size : { // TODO: sheet canvas size
                    w : 190,
                    h : 190
                },
                scale: 1
            }
        }
        return framesJson
    }

    return {
        add : function(name, position) {
            frames[name] = {
                frame : {
                    x: position.x,
                    y: position.y,
                    w: 32, // TODO: get from map config
                    h: 32 // TODO: get from map config
                },
                rotated: false,
                trimmed: true,
                "spriteSourceSize": {
                    x: position.x,
                    y: position.y,
                    w: 32, // TODO: get from map config
                    h: 32 // TODO: get from map config
                },
                "sourceSize": {
                    "w": 160, // TODO: get from map config
                    "h": 160 // TODO: get from map config
                }
            }
        },
        getFrames: generateFrameFile
    }
})()


// for testing purposes
//createMap({
//    name: 'test_map',
//    x: 20,
//    y: 20
//})