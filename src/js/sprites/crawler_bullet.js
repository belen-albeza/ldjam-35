'use strict';

const MOVE_SPEED = 500;

function CrawlerBullet(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'crawler_bullet');

    this.anchor.setTo(0.5, 1);

    this.game.physics.enable(this);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.reset(x, y);
}

CrawlerBullet.prototype = Object.create(Phaser.Sprite.prototype);
CrawlerBullet.constructor = CrawlerBullet;

CrawlerBullet.prototype.reset = function (x, y) {
    Phaser.Sprite.prototype.reset.call(this, x, y);
    this.body.velocity.y = -MOVE_SPEED;
};

module.exports = CrawlerBullet;
