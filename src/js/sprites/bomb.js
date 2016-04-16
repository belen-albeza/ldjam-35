'use strict';

const MOVE_SPEED = 220;
const ATTACK = 3;

function Bomb(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'bomb');

    this.anchor.setTo(0.5, 0);

    this.game.physics.enable(this);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.reset(x, y);

    this.attack = ATTACK;
}

Bomb.prototype = Object.create(Phaser.Sprite.prototype);
Bomb.constructor = Bomb;

Bomb.prototype.reset = function (x, y) {
    Phaser.Sprite.prototype.reset.call(this, x, y);
    this.body.velocity.y = MOVE_SPEED;
};

module.exports = Bomb;
