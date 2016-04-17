'use strict';

function Explosion(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'explosion');

    this.anchor.setTo(0.5, 0.5);
    this.animations.add('boom');

    this.reset(x, y);
}

// inherit from sprite
Explosion.prototype = Object.create(Phaser.Sprite.prototype);
Explosion.constructor = Explosion;

Explosion.prototype.reset = function (x, y) {
    Phaser.Sprite.prototype.reset.call(this, x, y);

    this.animations.play('boom', 10, false, true);
};


module.exports = Explosion;
