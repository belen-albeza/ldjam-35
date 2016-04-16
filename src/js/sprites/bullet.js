'use strict';

const MOVE_SPEED = 220;

function Bullet(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'bullet');

    this.anchor.setTo(0, 0.5);

    this.game.physics.enable(this);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.reset(x, y);
}

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.constructor = Bullet;

Bullet.prototype.reset = function (x, y) {
    Phaser.Sprite.prototype.reset.call(this, x, y);
    this.body.velocity.x = MOVE_SPEED;
};

module.exports = Bullet;
