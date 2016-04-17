'use strict';

var PlayScene = require('./play_scene.js');


var BootScene = {
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

        // image assets
        this.game.load.image('background', 'images/background.png');
        this.game.load.image('ship:fighter', 'images/ship_base.png');
        this.game.load.image('ship:bomber', 'images/ship_bomber.png');
        this.game.load.image('bullet', 'images/bullet.png');
        this.game.load.image('bomb', 'images/bomb.png');
        this.game.load.image('crawler_bullet', 'images/crawler_bullet.png');
        this.game.load.spritesheet('enemy:fighter', 'images/enemy00.png',
            54, 54);
        this.game.load.spritesheet('enemy:crawler', 'images/enemy01.png',
            96, 36);

        // audio assets
        this.game.load.audio('hit', 'audio/hit.wav');
        this.game.load.audio('ship_bullet', 'audio/ship_bullet.wav');
        this.game.load.audio('enemy_bullet', 'audio/enemy_bullet.wav');
        this.game.load.audio('bomb', 'audio/shoot_bomb.wav');
        this.game.load.audio('explosion', 'audio/explosion.wav');
        this.game.load.audio('shapeshift', 'audio/powerup.wav');
        this.game.load.audio('background',
            ['audio/background.mp3', 'audio/background.ogg']);
    },

    create: function () {
        this.game.state.start('play');
    }
};


window.onload = function () {
    var game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');

    game.state.add('boot', BootScene);
    game.state.add('preloader', PreloaderScene);
    game.state.add('play', PlayScene);

    game.state.start('boot');
};
