'use strict';

const MAX_MOVE_SPEED = 200;
const MIN_MOVE_SPEED = 50;

function Cloud(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'cloud00');

    this.anchor.setTo(0, 0.5);
    this.alpha = 0.7;

    this.game.physics.enable(this);
    this.checkWorldBounds = true;

    this.reset(x, y);
}

// inherit from sprite
Cloud.prototype = Object.create(Phaser.Sprite.prototype);
Cloud.constructor = Cloud;

Cloud.prototype.reset = function (x, y) {
    Phaser.Sprite.prototype.reset.call(this, x, y);
    this.body.velocity.x = this.game.rnd.between(
        MIN_MOVE_SPEED, MAX_MOVE_SPEED) * -1;
    this.outOfBoundsKill = false;
    this.events.onEnterBounds.addOnce(function () {
        this.outOfBoundsKill = true;
    }, this);
};


module.exports = Cloud;
