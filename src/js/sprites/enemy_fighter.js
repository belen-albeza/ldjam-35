'use strict';

function EnemyFighter(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'enemy:fighter');

    this.anchor.setTo(0.5);
    this.game.physics.enable(this);

    this.reset(x, y);
}

EnemyFighter.prototype = Object.create(Phaser.Sprite.prototype);
EnemyFighter.constructor = EnemyFighter;

EnemyFighter.prototype.reset = function (x, y) {
    Phaser.Sprite.prototype.reset.call(this, x, y);
    this.body.velocity.x = -100;
};

module.exports = EnemyFighter;
