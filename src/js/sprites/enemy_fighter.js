'use strict';

const MOVE_SPEED = 125;

function EnemyFighter(game, x, y, path) {
    Phaser.Sprite.call(this, game, x, y, 'enemy:fighter');

    this.anchor.setTo(0.5);
    this.game.physics.enable(this);

    this.reset(x, y, path);
}

EnemyFighter.prototype = Object.create(Phaser.Sprite.prototype);
EnemyFighter.constructor = EnemyFighter;

EnemyFighter.prototype.reset = function (x, y, path) {
    Phaser.Sprite.prototype.reset.call(this, x, y);

    this.body.velocity.x = -MOVE_SPEED; // TODO: temp
    this.path = path;
};

module.exports = EnemyFighter;
