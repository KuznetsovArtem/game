/**
 * Created by askuznetsov on 7/22/2014.
 */
var mapObject;

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
    },
    control : {
        mapMoveSpeed: 2.5
    }
};

var editorEvent = new Event("savemap");

var constuct =  function(map, load) {
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

    /**
     * map keybord movement
     */
    function moveMap(obj, direction) {
        obj.position.x += Math.cos(direction) * conf.control.mapMoveSpeed;
        obj.position.y += Math.sin(direction) * conf.control.mapMoveSpeed;
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
        kd.tick();
        renderer.render(mapStage);
        sheetRenderer.render(spriteStage);

        requestAnimFrame(animate);
    }

    // fxes
    mapObject = map;
    if(load && typeof load === 'function') {
        load();
    }

    document.addEventListener("savemap", function(e) {
        console.log("event", e)
        sheetRenderer.render(spriteStage);
        var spriteSheetImg = sheetRenderer.view.toDataURL();

        $.ajax({
            url: '/map/saveimage/' + mapObject.name,
            type: 'POST',
            data: {
                img : sheetRenderer.view.toDataURL("image/png")
            },
//            contentType: 'image/png; charset=utf-8',
//            dataType: 'json',
            async: true,
            success: function(msg) {
                console.log(msg);
            }
        });
    }, false);
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
                        brush.editTile(this.self.index);
                        var brushTexture = brush.get()||"/editor/tiles/etst/t1.png"
                        this.texture = PIXI.Texture.fromImage(brushTexture);
                    }
                    sprite.mouseover = function(e) {
                        if(e.originalEvent.ctrlKey) {
                            brush.editTile(this.self.index);
                            var brushTexture = brush.get()||"/editor/tiles/etst/t1.png"
                            this.texture = PIXI.Texture.fromImage(brushTexture);
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

/**
 * Loads selected map's json from server
 * @param map String
 */
function loadMap(map) {
    $.ajax({
        url: '/map/load/' + map,
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        async: false,
        success: function(data) {
            constuct(data.map, function() {
                console.log('callb from construct', data.map.textures);
                for(var n in data.map.textures) {
                    brush.set(data.sheetUrls.urls[data.map.textures[n]]);
                }

                for (var i = 0; i < data.map.terrain.length; i++) {
                    for (var j = 0; j < data.map.terrain[i].length; j++) {
                        // TODO: dram old map
//                        brush.set(data.sheetUrls.urls[data.map.textures[data.map.terrain[i][j]]])
                    }
                }

            });
            console.log(data);
        }
    })
}

/**
 * Sends map jsones to server
 */
function saveMap() {
    console.log('try to save');

    mapObject.textures = brush.getTextures();
    var saveConfig = { // TODO: real urls for imgs
        name: mapObject.name,
        urls : brush.getImgUrls()
    }

    document.dispatchEvent(editorEvent);
    var data = {
        map: mapObject,
        frames : mapFrames.getFrames(),
        config : saveConfig
    }

    $.ajax({
        url: '/map/save/' + mapObject.name,
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        async: false,
        success: function(msg) {
            console.log(msg);
        }
    })

}

var brush = (function() {
    var canvas, config, currentBrush,
        textures = [],
        frames = {},
        texturesUrls = {};

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
        // save for map textrures obj
        textures.push(name);
        texturesUrls[name] = imgUrl;
        // add curren texture to sprite sheet
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
                frames[pic] = true;
            }
        },
        get : function() {
            return currentBrush;
        },
        getTextures : function() {
            var texturesObj = {};
            for(var i in textures) {
                texturesObj[i] = textures[i];
            }
            return texturesObj;
        },
        getImgUrls : function() {
            return texturesUrls;
        },
        editTile : function(pos) {
            var name = currentBrush.split('/');
            name = name[name.length - 1];
            mapObject.terrain[pos.x][pos.y] = textures.indexOf(name);
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
                image : mapObject.name + '.png',
                format: "RGBA8888",
                size : {
                    w : conf.sMap.W,
                    h : conf.sMap.H
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
                    w: conf.sMap.tile.W,
                    h: conf.sMap.tile.H
                },
                rotated: false,
                trimmed: false,
                "spriteSourceSize": {
                    x: position.x,
                    y: position.y,
                    w: conf.sMap.tile.W,
                    h: conf.sMap.tile.H
                },
                "sourceSize": {
                    "w": conf.sMap.W,
                    "h": conf.sMap.H
                }
            }
        },
        getFrames: generateFrameFile
    }
})();