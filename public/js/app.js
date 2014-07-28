/**
 * Created by askuznetsov on 7/7/2014.
 */

//window.onload=function(){}
document.addEventListener("DOMContentLoaded", function() {

    // configs
    var conf = {
        W : 512,
        H : 512,
        antialising: false
    };

    // init
    var camera = new PIXI.Stage(0xAABBCC);

    var stage = new PIXI.DisplayObjectContainer();
    // rem
    window.mp = stage;
    camera.addChild(stage)

    var renderer = PIXI.autoDetectRenderer(conf.W, conf.H, null, false, conf.antialising);
    document.body.appendChild(renderer.view);

    var assetLoader = new PIXI.AssetLoader(['/assets/grounds.json', '/assets/editor_map.json', '/assets/pe.json', '/assets/player.json', '/assets/SpriteSheet.json']);
//    var mapLoader = new PIXI.JsonLoader('/maps/L2.json');
    var mapLoader = new PIXI.JsonLoader('/maps/editor_map.json');

    //explosion test
    var explosions = [];
    var count = 0;

    /**
     * MAP
     **/
    var map;
    function drawMap(stage) {

        function texturedTile(id) {
            var texture = map.textures[id];
            return function (x, y) {
                var tile = PIXI.Sprite.fromFrame(texture);
                tile.position.x = x;
                tile.position.y = y;
                stage.addChild(tile);
            }
        }
        // TODO: rem when from assets
        function desTile(id) {
            return function (x, y) {
                var tile = PIXI.Sprite.fromImage(map.textures[id]);
                tile.position.x = x;
                tile.position.y = y;
                stage.addChild(tile);
            }
        }

        function drawTerrain(terrain) {
            var x, y;

            for (var i = 0, x = 0; i < terrain.length; i++, x +=  map.tileW) {
                for (var j = 0, y = 0; j < terrain[i].length; j++, y += map.tileH) {
                    drawTile = texturedTile(terrain[j][i]);
                    drawTile(x, y);
                }
            }

            drawDecor(map.decor);
        }

        function drawDecor(terrain) {
            var x, y;

            for (var i = 0, x = 0; i < terrain.length; i++, x +=  map.tileW) {
                for (var j = 0, y = 0; j < terrain[i].length; j++, y += map.tileH) {
                    if(terrain[j][i] === 0) continue;
                    desTile(terrain[j][i])(x, y);
                }
            }
        }
        function drawItems() {}

        drawTerrain(map.terrain);
    }

    // movement
    function move(obj, direction, speed) {
        // TODO: now def speed is 0.1 + move to conf
        var ds = 0.1;
        switch(direction) {
            case 'u':
                if(obj.position.y <= 0) {
                    break;
                }
                obj.position.y -= ds * speed;
                obj.rotation = 0;
                break;
            case 'd':
                if(obj.position.y >= map.size.height) {
                    break;
                }
                obj.position.y += ds * speed;
                obj.rotation = -Math.PI;
                break;
            case 'l':
                if(obj.position.x <= 0) {
                    break;
                }
                obj.position.x -= ds * speed;
                obj.rotation = -Math.PI / 2;
                break;
            case 'r':
                if(obj.position.x >= map.size.width) {
                    break;
                }
                obj.position.x += ds * speed;
                obj.rotation = Math.PI / 2;
                break;
        }
    }

    function moveAlpha(obj, direction, speed) {
        // TODO: now def speed is 0.1 + move to conf
        var ds = 0.1 * speed;
        obj.position.x += Math.cos(direction) * ds
        obj.position.y += Math.sin(direction) * ds
        // TODO: only legs rotation
        // obj.rotation = Math.PI / 2;
    }
    function moveMap(obj, direction, speed) {
        // TODO: now def speed is 0.1 + move to conf
        var ds = 0.1;
        var offset = 50;
        switch(direction) {
            case 'u':
                if(obj.position.y <= conf.H - map.size.height - offset) {
                    break;
                }
                obj.position.y -= ds * speed;
                break;
            case 'd':
                if(obj.position.y >= 0  + offset) {
                    break;
                }
                obj.position.y += ds * speed;
                break;
            case 'l':
                if(obj.position.x <= conf.W - map.size.width - offset) {
                    break;
                }
                obj.position.x -= ds * speed;
                break;
            case 'r':
                if(obj.position.x >= 0  + offset) {
                    break;
                }
                obj.position.x += ds * speed;
                break;
        }
    }


    /**
     * Player
     * TODO: player and enemy cat use a.generateTexture() from gr
     **/
    function player( ) {
//        var bulletGraph = new PIXI.Graphics();
//        bulletGraph.beginFill(0x00FF00);
//        bulletGraph.moveTo(10, 20);
//        bulletGraph.lineTo(20, 10);
//        bulletGraph.lineTo(2, 10);
//        bulletGraph.lineTo(10, 20);
//        bulletGraph.lineStyle(1, 0x0000FF, 1);
//        bulletGraph.endFill();
        //stage.addChild(bulletGraph)
//        var bullet;

//        function shoot() {
//            sprite = new PIXI.Sprite(bulletGraph.generateTexture());
//
//            sprite.position.x = dummy.position.x;
//            sprite.position.y = dummy.position.y + 100;
//
//            sprite.anchor.x = 0.5;
//            sprite.anchor.y = 0.5;
//
//            sprite.radius = 40;
//
//            //each bullet has to follow the camera and rotate in the complete opposite direction
//            //sprite.rotation = -camera.rotation;
//            sprite.pivot.y = sprite.radius + 80;
//            return sprite
//        }

        var dummyFrames = [];

        for(var i = 0; i <= 10; i++) {
            var val = i < 10 ? "0" + i : i;
            dummyFrames.push(PIXI.Texture.fromFrame('goodboy_' + val + '.png'));
        }

        var dummy = new PIXI.MovieClip(dummyFrames);
        dummy.position.x = 15;
        dummy.position.y = 15;
        dummy.anchor.x = 0.5;
        dummy.anchor.y = 0.5;
//        dummy.play();
        dummy.animationSpeed = 0.15;
        stage.addChild(dummy);

        window.dmm = dummy;

        var playerSpeed = 10;
        var p = {
            moveUp: function () {
                dummy.play();
//                move(dummy, 'u', playerSpeed);
                moveAlpha(dummy, -Math.PI/2, playerSpeed);
                moveMap(stage, 'd', playerSpeed / 2);
            },
            moveDown: function () {
                dummy.play();
//                move(dummy, 'd', playerSpeed);
                moveAlpha(dummy, Math.PI/2, playerSpeed);
                moveMap(stage, 'u', playerSpeed / 2);
            },
            moveLeft: function () {
                dummy.play();
//                move(dummy, 'l', playerSpeed);
                moveAlpha(dummy, Math.PI, playerSpeed);
//                moveMap(stage, 'r', 1 + conf.W / map.size.width);
                moveMap(stage, 'r', playerSpeed / 2);
            },
            moveRight: function () {
                dummy.play();
//                move(dummy, 'r', playerSpeed);
                moveAlpha(dummy, Math.PI/3, playerSpeed);
                moveMap(stage, 'l', playerSpeed / 2);
//                moveMap(stage, 'l', 1 + conf.W / map.size.width);
            }
        }
        var stageMove = {
            moveUp: function () {
                console.log()
                moveMap(stage, 'u', playerSpeed  * 3);
            },
            moveDown: function () {
                moveMap(stage, 'd', playerSpeed  * 3);
            },
            moveLeft: function () {
                moveMap(stage, 'l', playerSpeed  * 3);
            },
            moveRight: function () {
                moveMap(stage, 'r', playerSpeed  * 3);
            }
        }

        // map move
        kd.UP.down(stageMove.moveUp);
        kd.DOWN.down(stageMove.moveDown);
        kd.LEFT.down(stageMove.moveLeft);
        kd.RIGHT.down(stageMove.moveRight);
        // player move
        kd.W.down(p.moveUp);
        kd.S.down(p.moveDown);
        kd.A.down(p.moveLeft);
        kd.D.down(p.moveRight);

        return dummy;
    }
    /**
     * enemy
     **/
    function Thing(name, alive, defs) {
        if(alive) {
            this.name = name||'some obj';
            this.alive = !!alive;
            this.speed = defs.speed;
            // TODO: rem graph
            var graphic = new PIXI.Graphics();
            graphic.beginFill(defs.color);
            graphic.drawCircle(5, 5, defs.size);
            graphic.endFill();

//            var body = new PIXI.Sprite(graphic.generateTexture());
            var body = PIXI.Sprite.fromFrame('e.png');

            body.position.x = defs.x;
            body.position.y = defs.y;

            body.anchor.x = 0.5;
            body.anchor.y = 0.5;

            body.radius = 40;
            this.body = body;

            stage.addChild(this.body);
        }
    }

    Thing.prototype.onColision = function(o) {
        if(o.type === "bullet") {
            //kill
        }
    }

    var enemies = [];
    function addEnemies(count) {

        var enemy = new Thing('enemy1', 1, {
            x: conf.W - 35,
            y: 15,
            size: 12,
            color: 0x0000FF,
            speed: 10
        });
        enemies.push(enemy)

        var enemy2 = new Thing('enemy2', 1, {
            x: conf.W - 135,
            y: 15,
            size: 9,
            color: 0x0000FF,
            speed: 17
        });
        enemies.push(enemy2)
    }

    function enemyAI(obj) {
        if (obj.body.position.y < conf.H - 40) {
            move(obj.body, 'd', obj.speed);
        } else {
            return;
        }
    }

    function enemiesLife(enemies) {
        for (var i = 0; i < enemies.length; i++) {
            enemyAI(enemies[i])
        }
    }
    //// ===========================

    easyCollision = function() {

//        if(bullet) {
//            bullet.position.y -= 4
//            bullet.position.x += 4
//        }
//
//        if(dummy.position.x < -5 || dummy.position.y < -5 ||
//            dummy.position.x > conf.W || dummy.position.y > conf.H) {
//            document.getElementById('msg').style.display = "block"
//        }
    }

    camera.mousedown = function(e) {
//        bullet = shoot();
//        console.log("shoot", bullet);
//        stage.addChild(bullet);
    }

    // Loading

    mapLoader.on("loaded", function(data) {
        map = data.content.json
        // for map movement
        map.size = {
            width: map.tileW * map.terrain.length,
            height: map.tileH * map.terrain[0].length
        };
        assetLoader.load();
    });
    mapLoader.on("error", function(err) {
        console.warn('map: ', err)
    });
    mapLoader.load();
    assetLoader.onComplete = start;


    // start game
    function start() {

        drawMap(stage);
//+++++++++++++++++++++++++++++ TESTS

//++++++++++++++++++++++++++++++++++++ END OF TESTS
        var pl = player();
        addEnemies();


        // explosion test
        var explosionTextures = [];
        for (var i=1; i <= 26; i++)   {
            var texture = PIXI.Texture.fromFrame("Explosion_Sequence_A " + i + ".png");
            explosionTextures.push(texture);
        };

        for (var i = 0; i < 50; i++) {
            var explosion = new PIXI.MovieClip(explosionTextures);
            explosion.position.x = Math.random() * map.tileW * map.terrain.length;
            explosion.position.y = Math.random() * map.tileH * map.terrain[0].length;
            explosion.anchor.x = 0.5;
            explosion.anchor.y = 0.5;
            explosion.rotation = Math.random() * Math.PI;
            explosion.scale.x = explosion.scale.y = 0.75 + Math.random() * 0.5;
            explosion.gotoAndPlay(Math.random() * 27);
//            stage.addChild(explosion);
        }

        function animate() {

            kd.tick();
//            pl.play();
            enemiesLife(enemies);
//            easyCollision();

            requestAnimFrame(animate);

            renderer.render(camera);
            pl.stop();
        }

        requestAnimFrame(animate);
    }

    // https://github.com/GoodBoyDigital/pixi.js/wiki/Resources
    // http://www.dumbmanex.com/bynd_freestuff.html
}, false);


//
//var assetsToLoader = [ "SpriteSheet.json"];
// create a new loader
//loader = new PIXI.AssetLoader(assetsToLoader);
//// use callback
//loader.onComplete = onAssetsLoaded
////begin load
//loader.load();
//// holder to store aliens
//var explosions = [];
//var count = 0;
//// create an new instance of a pixi stage
//var stage = new PIXI.Stage(0xFFFFFF);
//// create a renderer instance.
//renderer = PIXI.autoDetectRenderer(800, 600);
//// add the renderer view element to the DOM
//document.body.appendChild(renderer.view);
//function onAssetsLoaded()
//{
//    // create an array to store the textures
//    var explosionTextures = [];
//
//    for (var i=0; i < 26; i++)   {
//        var texture = PIXI.Texture.fromFrame("Explosion_Sequence_A " + (i+1) + ".png");
//        explosionTextures.push(texture);
//    };
//
//    for (var i = 0; i < 50; i++)    {
//        // create an explosion MovieClip
//        var explosion = new PIXI.MovieClip(explosionTextures);
//
//        explosion.position.x = Math.random() * 800;
//        explosion.position.y = Math.random() * 600;
//        explosion.anchor.x = 0.5;
//        explosion.anchor.y = 0.5;
//
//        explosion.rotation = Math.random() * Math.PI;
//        explosion.scale.x = explosion.scale.y = 0.75 + Math.random() * 0.5;
//
//        explosion.gotoAndPlay(Math.random() * 27);
//
//        stage.addChild(explosion);
//    }
//    // start animating
//    requestAnimFrame( animate );
//}
//
//function animate() {
//    renderer.render(stage);
//
//    requestAnimFrame(animate);
//}