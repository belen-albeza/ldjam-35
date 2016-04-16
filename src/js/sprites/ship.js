'use strict';

const Bullet = require('./bullet.js');
const Bomb = require('./bomb.js');

const CADENCE = 5; // bullets / s
const MOVE_SPEED = {fighter: 120, bomber: 90};
const SHOT_TYPE = {fighter: Bullet, bomber: Bomb};

function Ship(game, x, y, mode) {
    Phaser.Sprite.call(this, game, x, y, 'ship:' + mode);

    this.mode = mode;
    this.anchor.setTo(0.5);

    this.game.physics.enable(this);
    this.body.collideWorldBounds = true;

    this.lastTimestamp = 0;
    this.elapsed = 0;
}

// inherit from Phaser.Sprite
Ship.prototype = Object.create(Phaser.Sprite.prototype);
Ship.prototype.constructor = Ship;

Ship.SHAPE_FIGHTER = 'fighter';
Ship.SHAPE_BOMBER = 'bomber';


Ship.prototype.update = function () {
    this.elapsed += this.game.time.elapsedMS / 1000.0;
};

Ship.prototype.move = function (dirX, dirY) {
    this.body.velocity.setTo(
        dirX * MOVE_SPEED[this.mode],
        dirY * MOVE_SPEED[this.mode]);
};


Ship.prototype.shoot = function (groups) {
    let group = groups[this.mode];

    if (this.elapsed - this.lastTimestamp > 1 / CADENCE) {
        // spawn shot
        let x = this.x + (this.mode === Ship.SHAPE_FIGHTER ?
            this.width / 2 : 0);
        let y = this.y + (this.mode === Ship.SHAPE_BOMBER ?
            this.height / 2 : 0);

        let shot = group.getFirstExists(false);
        if (shot) {
            shot.reset(x, y);
        }
        else {
            group.add(new SHOT_TYPE[this.mode](this.game, x, y));
        }

        // update timestamp
        this.lastTimestamp = this.elapsed;
    }
};

module.exports = Ship;
