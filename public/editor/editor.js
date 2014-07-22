/**
 * Created by askuznetsov on 7/22/2014.
 */
document.addEventListener("DOMContentLoaded", function() {

    // configs
    var conf = {
        W: 800,
        H: 800,
        antialising: false
    };

    // init
    var camera = new PIXI.Stage(0xAABBCC);

    var stage = new PIXI.DisplayObjectContainer();

    var renderer = PIXI.autoDetectRenderer(conf.W, conf.H, null, false, conf.antialising);
    document.getElementById('map-editor').appendChild(renderer.view);

}, false)