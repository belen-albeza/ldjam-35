'use strict';

const Ship = require('./ship.js');

let PlayScene = {};

PlayScene.create = function () {
    // set up input
    this.keys = this.game.input.keyboard.createCursorKeys();

    // create background
    this.game.add.image(0, 0, 'background');

    // create player's ship
    this.ship = new Ship(this.game, 20, 100);
    this.game.add.existing(this.ship);
};

PlayScene.update = function () {
    // handle ship movement
    let dirX = 0, dirY = 0;
    if (this.keys.left.isDown) { dirX = -1; }
    if (this.keys.right.isDown) { dirX = 1; }
    if (this.keys.up.isDown) { dirY = -1; }
    if (this.keys.down.isDown) { dirY = 1;}

    this.ship.move(dirX, dirY);
};

module.exports = PlayScene;
