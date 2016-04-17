'use strict';

const MOVE_SPEED = 375;
const FUZZY_EPSILON = 10;
const MAX_HEALTH = 2;

function EnemyFighter(game, x, y, path) {
    Phaser.Sprite.call(this, game, x, y, 'enemy:fighter');

    this.anchor.setTo(0.5);
    this.game.physics.enable(this);

    this.animations.add('move', [0], 1);
    this.animations.add('hit', [1, 2], 10);

    this.reset(x, y, path);
}

EnemyFighter.prototype = Object.create(Phaser.Sprite.prototype);
EnemyFighter.constructor = EnemyFighter;


EnemyFighter.prototype.reset = function (x, y, path) {
    Phaser.Sprite.prototype.reset.call(this, x, y, MAX_HEALTH);
    this.animations.play('move');

    this.path = path;
    this.spawnPosition = {x: x, y: y};
    this.currentWaypoint = 0;
};

EnemyFighter.prototype.update = function () {
    if (!this.alive) { return; } // TODO: report this bug to Phaser

    let target = {
        x: this.spawnPosition.x + this.path[this.currentWaypoint].x,
        y: this.spawnPosition.y + this.path[this.currentWaypoint].y
    };

    let distance = this.game.math.distance(this.x, this.y, target.x, target.y);
    if (distance > FUZZY_EPSILON) {
        let angle = this.game.math.angleBetween(
            this.x, this.y, target.x, target.y);
        let coeff = Math.min(distance * 0.05, 1);
        this.body.velocity.setTo(
            Math.cos(angle) * MOVE_SPEED * coeff,
            Math.sin(angle) * MOVE_SPEED * coeff
        );
    }

    if (distance <= FUZZY_EPSILON) {
        this.position.setTo(target.x, target.y); // snap

        this.currentWaypoint += 1;
        if (this.currentWaypoint >= this.path.length) {
            this.kill();
        }
    }
};

EnemyFighter.prototype.hit = function(energy) {
    this.damage(energy);
    this.flash();
};

EnemyFighter.prototype.flash = function () {
    this.animations.play('hit').onComplete.addOnce(function () {
        this.animations.play('move');
    }, this);
};

module.exports = EnemyFighter;
