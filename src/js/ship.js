'use strict';

const MOVE_SPEED = 150;

function Ship(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'ship:base');

    this.anchor.setTo(0.5);
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;
}

// inherit from Phaser.Sprite
Ship.prototype = Object.create(Phaser.Sprite.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.move = function (dirX, dirY) {
    this.body.velocity.setTo(dirX * MOVE_SPEED, dirY * MOVE_SPEED);
};

module.exports = Ship;
