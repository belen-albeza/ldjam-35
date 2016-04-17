/* jshint -W014 */

'use strict';

const Ship = require('./sprites/ship.js');
const EnemyFighter = require('./sprites/enemy_fighter.js');
const EnemyCrawler = require('./sprites/enemy_crawler.js');
const Wave = require('./wave.js');

const CRAWLER_PATTERNS = [
    {
        positions: [{x: 0, y: 0}],
        range: {y: {min: 600, max: 600}}
    }
];

const FIGHTER_PATTERNS = [
    {
        positions: [
            {x: 0, y: 0}, {x: 60, y: 90}, {x: 120, y: 180}, {x: 180, y: 270}
        ], path: [
            {x: -300, y: 0}, {x: -360, y: -120}, {x: -1150, y: -120}
        ], range: {y: {min: 170, max: 300}}
    }, {
        positions: [
            {x: 0, y: -40}, {x: 80, y: 40}, {x: 160, y: -40}, {x: 240, y: 40},
            {x: 320, y: -40}
        ], path: [
            {x: -1150, y: 0}
        ], range: {y: {min: 100, max: 450}}
    }
];

const WAVE_PATTERNS = {
    crawlers: CRAWLER_PATTERNS,
    fighters: FIGHTER_PATTERNS
};

const ENEMY_TYPE_CHANCES = ['fighters', 'fighters', 'fighters', 'fighters',
    'crawlers'];


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
    this.sfx = {
        explosion: this.game.add.audio('explosion'),
        shipBullet: this.game.add.audio('ship_bullet'),
        enemyBullet: this.game.add.audio('enemy_bullet'),
        bomb: this.game.add.audio('bomb'),
        hit: this.game.add.audio('hit'),
        shift: this.game.add.audio('shapeshift')
    };
    this.backgroundMusic = this.game.add.audio('background');
    this.backgroundMusic.loopFull(1.5);

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

    this.hud = this.game.add.group();
    this.scoreText = this.game.make.text(10, 10, '0 PTS', {
        font: '20px Courier, monospace',
        fill: '#fff'
    });
    this.hud.add(this.scoreText);
    this.score = 0;

    this.spawnerTimer = this.game.time.create();

    this.spawnerTimer.loop(2000, function () {
        let enemyType = this.game.rnd.pick(ENEMY_TYPE_CHANCES);
        let pattern = this.game.rnd.pick(WAVE_PATTERNS[enemyType]);
        let enemyClass = enemyType === 'fighters' ? EnemyFighter : EnemyCrawler;

        let y = this.game.rnd.between(pattern.range.y.min, pattern.range.y.max);
        (new Wave(enemyClass, pattern.positions, pattern.path))
            .spawn(this.enemies[enemyType], 1100, y);
    }, this);
    this.spawnerTimer.start();
};

PlayScene.update = function () {
    if (this.ship.alive) {
        // handle ship movement
        let dirX = 0, dirY = 0;
        if (this.keys.left.isDown) { dirX = -1; }
        if (this.keys.right.isDown) { dirX = 1; }
        if (this.keys.up.isDown) { dirY = -1; }
        if (this.keys.down.isDown) { dirY = 1; }
        this.ship.move(dirX, dirY);

        // shoot if button is pressed
        if (this.keys.spacebar.isDown) {
            this.ship.shoot(this.shipShots,
                {fighter: this.sfx.shipBullet, bomber: this.sfx.bomb});
        }
    }

    // make crawlers to randomly shoot
    this.enemies.crawlers.forEachAlive(function (enemy) {
        if (this.game.rnd.between(0, 1000) < 15) {
            enemy.shoot(this.enemyShots.crawlers, this.sfx.enemyBullet);
        }
    }, this);

    // handle collisions
    this._collideShotsVsEnemies();
    if (this.ship.alive) {
        this._collideEnemyShotsVsShip();
        this._collideEnemiesVsShip();
    }
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

        this.sfx.shift.play();
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
        this._addPoints(50);
        this.sfx.explosion.play();
        // TODO: create explosion
    }
    else {
        this.sfx.hit.play('', 0, 2); // louder
    }
};

PlayScene._hitShipWithShot = function (shot) {
    shot.kill();
    this._hitShip();
};

PlayScene._hitShip = function () {
    this.ship.kill();
    // TODO: big explosion
    this.sfx.explosion.play();
    this.spawnerTimer.stop();
    this._showGameOver();
};

PlayScene._wrathOfGod = function () {
    this.backgroundMusic.stop();
    this.spawnerTimer.destroy();
    this.game.state.restart();
};

PlayScene._addPoints = function (points) {
    this.score += points;
    this.scoreText.setText(this.score + ' PTS');
};

PlayScene._showGameOver = function () {
    this.hud.visible = false;

    let gameOverText = this.game.add.text(480, 250, 'Game Over', {
        font: '40px Courier, monospace',
        fill: '#fff'
    });
    gameOverText.anchor.setTo(0.5);

    let finalScoreText = this.game.add.text(480, 310, this.score + ' PTS', {
        font: '30px Courier, monospace',
        fill: '#fff'
    });
    finalScoreText.anchor.setTo(0.5);

    let restartText = this.game.add.text(480, 350, '- Play again -', {
        font: '30px Courier, monospace',
        fill: '#fff'
    });
    restartText.anchor.setTo(0.5);
    restartText.inputEnabled = true;
    restartText.input.useHandCursor = true;
    restartText.events.onInputUp.add(function () {
      this._wrathOfGod();
    }, this);
};


module.exports = PlayScene;
