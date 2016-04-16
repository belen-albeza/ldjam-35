'use strict';

const MOVE_SPEED = 220;

function Bullet(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'bullet');

    this.anchor.setTo(0.5);
    this.game.physics.enable(this);

    this.body.velocity.x = MOVE_SPEED;
}

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.constructor = Bullet;

module.exports = Bullet;
