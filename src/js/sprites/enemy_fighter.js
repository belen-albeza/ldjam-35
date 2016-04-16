'use strict';

const MOVE_SPEED = 125;
const FUZZY_EPSILON = 3;

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

    // this.body.velocity.x = -MOVE_SPEED; // TODO: temp

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
            this.kill(); // TODO: temp
        }
    }
};

module.exports = EnemyFighter;
