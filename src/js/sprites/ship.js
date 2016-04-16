'use strict';

const MOVE_SPEED = 120; // pixels / s
const CADENCE = 5; // bullets / s

const Bullet = require('./bullet.js');

function Ship(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'ship:base');

    this.anchor.setTo(0.5);
    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;

    this.lastTimestamp = 0;
    this.elapsed = 0;
}

// inherit from Phaser.Sprite
Ship.prototype = Object.create(Phaser.Sprite.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype.update = function () {
    this.elapsed += this.game.time.elapsedMS / 1000.0;
};

Ship.prototype.move = function (dirX, dirY) {
    this.body.velocity.setTo(dirX * MOVE_SPEED, dirY * MOVE_SPEED);
};


Ship.prototype.shoot = function (group) {
    if (this.elapsed - this.lastTimestamp > 1 / CADENCE) {
        // spawn bullet
        let x = this.x + this.width / 2;
        let y = this.y;

        let bullet = group.getFirstExists(false);
        if (bullet) {
            bullet.reset(x, y);
        }
        else {
            bullet = new Bullet(this.game, x, y);
            group.add(bullet);
        }

        // update timestamp
        this.lastTimestamp = this.elapsed;
    }
};

module.exports = Ship;
