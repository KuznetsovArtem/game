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
    // Map and spriteSheet
    var mapStage = new PIXI.Stage('', true); // interactive
    var spriteStage = new PIXI.Stage('');

    var renderer = PIXI.autoDetectRenderer(conf.W, conf.H, null, true);
    document.getElementById('map-editor').appendChild(renderer.view);

    var sheetRenderer = PIXI.autoDetectRenderer(160, 160, null, true);
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
    fx = {
        makeSquere: function(map) {
            graphic = new PIXI.Graphics();
            graphic.lineStyle(1, 0xfafafa);
            graphic.drawRect(0, 0, map.tileW -10, map.tileH -10);
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
        test: function() {
            var sp1 = new MapTerSprite({x: 2, y:4});
            var sp2 = new MapTerSprite({x: 25, y:14});
            console.log(sp1, sp1.getIndex(), sp2, sp2.getIndex());
        },
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
                        console.log(this, "clicked on sprite", e);
                        var brushTexture = brush.get()||"/editor/tiles/etst/t1.png"
                        this.texture = PIXI.Texture.fromImage(brushTexture);
                    }
                    sprite.mouseover = function(e) {
                        if(e.originalEvent.ctrlKey) {
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


var brush = (function() {
    var current;
    return {
        set : function(pic) {
            current = pic;
            console.log('brush set to: ' + current);
        },
        get : function() {
            return current;
        }
    }
})();