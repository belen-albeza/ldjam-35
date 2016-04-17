/* jshint -W014 */

'use strict';

const Ship = require('./sprites/ship.js');
const EnemyFighter = require('./sprites/enemy_fighter.js');
const EnemyCrawler = require('./sprites/enemy_crawler.js');
const Wave = require('./wave.js');

let PlayScene = {};

PlayScene.init = function () {
    // set up input
    this.keys = this.game.input.keyboard.createCursorKeys();
    this.keys.spacebar = this.game.input.keyboard.addKey(
        Phaser.Keyboard.SPACEBAR);
    this.keys.tab = this.game.input.keyboard.addKey(
        Phaser.Keyboard.TAB);
    this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);
    this.game.input.keyboard.addKeyCapture(Phaser.Keyboard.TAB);

    this.keys.tab.onDown.add(this._shapeShift, this);
};

PlayScene.create = function () {
    // create background
    this.game.add.image(0, 0, 'background');

    // create player's ship
    this.shipGroup = this.game.add.group();

    this.ship = new Ship(this.game, 60, 300, Ship.SHAPE_FIGHTER);
    this.shipGroup.add(this.ship);

    this.shipShots = {
        fighter: this.game.add.group(),
        bomber: this.game.add.group()
    };
    this.enemies = {
        fighters: this.game.add.group(),
        crawlers: this.game.add.group()
    };
    this.enemyShots = {
        crawlers: this.game.add.group()
    };

    // TODO: temp
    let wave = new Wave(EnemyFighter, [
        {x: 0, y: 0}, {x: 60, y: 90}, {x: 120, y: 180}, {x: 180, y: 270}
    ], [
        {x: -300, y: 0}, {x: -360, y: -120}, {x: -1150, y: -120}
    ]);

    wave.spawn(this.enemies.fighters, 1000, 285);

    (new Wave(EnemyCrawler, [
        {x: 0, y: 0}, {x: 200, y: 0}
    ], [])).spawn(this.enemies.crawlers, 1100, 600);
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

    // make crawlers to randomly shoot
    this.enemies.crawlers.forEachAlive(function (enemy) {
        if (this.game.rnd.between(0, 1000) < 15) {
            enemy.shoot(this.enemyShots.crawlers);
        }
    }, this);

    // handle collisions
    this._collideShotsVsEnemies();
    this._collideEnemyShotsVsShip();
    this._collideEnemiesVsShip();
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
    Object.keys(this.enemies).forEach(function (enemyKey) {
        Object.keys(this.shipShots).forEach(function (shotKey) {
            this.game.physics.arcade.overlap(
                this.shipShots[shotKey], this.enemies[enemyKey],
                this._hitEnemy, null, this);
        }, this);
    }, this);
};

PlayScene._collideEnemyShotsVsShip = function () {
    Object.keys(this.enemyShots).forEach(function (shotKey) {
        this.game.physics.arcade.overlap(this.enemyShots[shotKey], this.ship,
            this._hitShipWithShot, null, this);
    }, this);
};

PlayScene._collideEnemiesVsShip = function () {
    Object.keys(this.enemies).forEach(function (enemyKey) {
        this.game.physics.arcade.overlap(this.enemies[enemyKey], this.ship,
            this._hitShip, null, this);
    }, this);
};


PlayScene._hitEnemy = function (shot, enemy) {
    enemy.hit(shot.attack);
    shot.kill();
    if (!enemy.alive) {
        // TODO: explosion
    }
};

PlayScene._hitShipWithShot = function (shot) {
    shot.kill();
    this._hitShip();
};

PlayScene._hitShip = function () {
    // TODO: big explosion
    // TODO: proper game over overlay
    window.alert('Game Over');
    this._wrathOfGod();
};

PlayScene._wrathOfGod = function () {
    this.game.state.restart();
};


module.exports = PlayScene;
