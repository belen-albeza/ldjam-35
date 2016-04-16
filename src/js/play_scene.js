/* jshint -W014 */

'use strict';

const Ship = require('./sprites/ship.js');
const EnemyFighter = require('./sprites/enemy_fighter.js');
const Wave = require('./wave.js');

let PlayScene = {};

PlayScene.create = function () {
    // set up input
    this.keys = this.game.input.keyboard.createCursorKeys();
    this.keys.spacebar = this.game.input.keyboard.addKey(
        Phaser.Keyboard.SPACEBAR);
    this.keys.tab = this.game.input.keyboard.addKey(
        Phaser.Keyboard.TAB);
    this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);
    this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.TAB);

    this.keys.tab.onDown.add(this._shapeShift, this);

    // create background
    this.game.add.image(0, 0, 'background');

    // create player's ship
    this.shipGroup = this.game.add.group();

    this.ship = new Ship(this.game, 20, 100, Ship.SHAPE_BOMBER);
    this.shipGroup.add(this.ship);

    this.shipShots = {
        fighter: this.game.add.group(),
        bomber: this.game.add.group()
    };

    this.fighterGroup = this.game.add.group();

    // TODO: temp
    let wave = new Wave(EnemyFighter, [
        {x: 0, y: 0}, {x: 20, y: 30}, {x: 40, y: 60}, {x: 60, y: 90}
    ], [
        {x: -100, y: 0}, {x: -120, y: -40}, {x: -450, y: -40}
    ]);

    wave.spawn(this.fighterGroup, 300, 95);
};

PlayScene.update = function () {
    // handle ship movement
    let dirX = 0, dirY = 0;
    if (this.keys.left.isDown) { dirX = -1; }
    if (this.keys.right.isDown) { dirX = 1; }
    if (this.keys.up.isDown) { dirY = -1; }
    if (this.keys.down.isDown) { dirY = 1; }
    this.ship.move(dirX, dirY);

    // shoot if button is pressed
    if (this.keys.spacebar.isDown) {
        this.ship.shoot(this.shipShots);
    }

    // handle collisions
    this._collideShotsVsEnemies();
};

PlayScene._shapeShift = function () {
    if (this.ship && this.ship.alive) {
        let position = this.ship.position;
        let mode = this.ship.mode === Ship.SHAPE_BOMBER
            ? Ship.SHAPE_FIGHTER
            : Ship.SHAPE_BOMBER;
        this.ship.destroy();
        this.ship = new Ship(this.game, position.x, position.y, mode);
        this.shipGroup.add(this.ship);
    }
};

PlayScene._collideShotsVsEnemies = function () {
    this.game.physics.arcade.overlap(this.shipShots[Ship.SHAPE_FIGHTER],
        this.fighterGroup, this._hitEnemy, null, this);
    this.game.physics.arcade.overlap(this.shipShots[Ship.SHAPE_BOMBER],
        this.fighterGroup, this._hitEnemy, null, this);
};

PlayScene._hitEnemy = function (shot, enemy) {
    enemy.hit(shot.attack);
    shot.kill();
    if (!enemy.alive) {
        // TODO: explosion
    }
};

module.exports = PlayScene;
