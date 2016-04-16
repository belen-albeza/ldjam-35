'use strict';

var PlayScene = require('./play_scene.js');


var BootScene = {
    init: function () {
        // 4x scale
        this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
        // this.game.scale.setUserScale(4, 4);
        // enable crisp rendering
        this.game.renderer.renderSession.roundPixels = true;
        Phaser.Canvas.setImageRenderingCrisp(this.game.canvas);
    },

    preload: function () {
        // load here assets required for the loading screen
        this.game.load.image('preloader_bar', 'images/preloader_bar.png');
    },

    create: function () {
        this.game.state.start('preloader');
    }
};


var PreloaderScene = {
    preload: function () {
        this.loadingBar = this.game.add.sprite(0, 240, 'preloader_bar');
        this.loadingBar.anchor.setTo(0, 0.5);
        this.load.setPreloadSprite(this.loadingBar);

        // load here the assets for the game
        this.game.load.image('background', 'images/background.png');
        this.game.load.image('ship:base', 'images/ship_base.png');
        this.game.load.image('bullet', 'images/bullet.png');
        this.game.load.image('enemy:fighter', 'images/enemy00.png');
    },

    create: function () {
        this.game.state.start('play');
    }
};


window.onload = function () {
    var game = new Phaser.Game(320, 200, Phaser.AUTO, 'game');

    game.state.add('boot', BootScene);
    game.state.add('preloader', PreloaderScene);
    game.state.add('play', PlayScene);

    game.state.start('boot');
};
