(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var PlayScene = require('./play_scene.js');


var BootScene = {
    init: function () {
        this.game.renderer.renderSession.roundPixels = true;
    },

    preload: function () {
        // load here assets required for the loading screen
        this.game.load.image('preloader_bar', 'images/preloader_bar.png');
    },

    create: function () {
        this.game.state.start('preloader');
    }
};


var PreloaderScene = {
    preload: function () {
        this.loadingBar = this.game.add.sprite(0, 240, 'preloader_bar');
        this.loadingBar.anchor.setTo(0, 0.5);
        this.load.setPreloadSprite(this.loadingBar);

        // image assets
        this.game.load.image('background', 'images/background.png');
        this.game.load.image('ship:fighter', 'images/ship_fighter.png');
        this.game.load.image('ship:bomber', 'images/ship_bomber.png');
        this.game.load.image('bullet', 'images/ship_bullet.png');
        this.game.load.image('bomb', 'images/ship_bomb.png');
        this.game.load.image('crawler_bullet', 'images/crawler_bullet.png');
        this.game.load.image('cloud00', 'images/cloud00.png');
        this.game.load.spritesheet('enemy:fighter', 'images/enemy00.png',
            54, 54);
        this.game.load.spritesheet('enemy:crawler', 'images/enemy01.png',
            90, 33);
        this.game.load.spritesheet('explosion', 'images/explosion.png', 96, 96);

        // audio assets
        this.game.load.audio('hit', 'audio/hit.wav');
        this.game.load.audio('ship_bullet', 'audio/ship_bullet.wav');
        this.game.load.audio('enemy_bullet', 'audio/enemy_bullet.wav');
        this.game.load.audio('bomb', 'audio/shoot_bomb.wav');
        this.game.load.audio('explosion', 'audio/explosion.wav');
        this.game.load.audio('shapeshift', 'audio/powerup.wav');
        this.game.load.audio('background',
            ['audio/background.mp3', 'audio/background.ogg']);
    },

    create: function () {
        this.game.state.start('play');
    }
};


function startGame() {
    var game = new Phaser.Game(900, 600, Phaser.AUTO, 'game');

    game.state.add('boot', BootScene);
    game.state.add('preloader', PreloaderScene);
    game.state.add('play', PlayScene);

    game.state.start('boot');
}

window.onload = function () {
  // // for dev mode
  // document.querySelector('.overlay').style.display = 'none';
  // startGame();

  // for production
  document.getElementById('play').addEventListener('click', function (evt) {
    evt.preventDefault();
    // hide overlay
    document.querySelector('.overlay').style.display = 'none';
    startGame();
  });
};

},{"./play_scene.js":2}],2:[function(require,module,exports){
/* jshint -W014 */

'use strict';

const Ship = require('./sprites/ship.js');
const EnemyFighter = require('./sprites/enemy_fighter.js');
const EnemyCrawler = require('./sprites/enemy_crawler.js');
const Wave = require('./wave.js');
const Cloud = require('./sprites/cloud.js');
const Explosion = require('./sprites/explosion.js');

const CRAWLER_PATTERNS = [
    {
        positions: [{x: 0, y: 0}],
        range: {y: {min: 600, max: 600}}
    },
    {
        positions: [{x: 0, y: 0}, {x: 100, y: 0}],
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
    },
    {
        positions: [
            {x: 0, y: 0}, {x: 100, y: -50}, {x: 200, y: -100},
            {x: 100, y: 50}, {x: 200, y: 100}
        ], path: [
            {x: -600, y: 0}, {x: -400, y: 0}, {x: -1150, y: 0}
        ], range: {y: {min: 150, max: 450}}
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
    // spawn clouds
    this.clouds = this.game.add.group();
    for (let i = 0; i < 3; i++) { // some initial clouds
        this.clouds.add(new Cloud(
            this.game,
            this.game.rnd.between(0, 900),
            this.game.rnd.between(100, 400)));
    }
    // keep spawning clouds
    for (let i = 0; i < 5; i++) {
        let cloud = this._spawnCloud();
        cloud.events.onKilled.addOnce(this._spawnCloud, this);
    }

    this.explosions = this.game.add.group();


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
        font: '20px "Fugaz One", monospace',
        fill: '#ffa300'
    });
    this.scoreText.stroke = '#7e2553';
    this.scoreText.strokeThickness = 6;
    this.hud.add(this.scoreText);
    this.score = 0;

    this.spawnerTimer = this.game.time.create();

    this.spawnerTimer.loop(2000, function () {
        let enemyType = this.game.rnd.pick(ENEMY_TYPE_CHANCES);
        let pattern = this.game.rnd.pick(WAVE_PATTERNS[enemyType]);
        let enemyClass = enemyType === 'fighters' ? EnemyFighter : EnemyCrawler;

        let y = this.game.rnd.between(pattern.range.y.min, pattern.range.y.max);
        (new Wave(enemyClass, pattern.positions, pattern.path))
            .spawn(this.enemies[enemyType], 1050, y);
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
        this._spawnExplosion(enemy.x, enemy.y);
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
    this.sfx.explosion.play();
    this._spawnExplosion(this.ship.x, this.ship.y);

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

    let gameOverText = this.game.add.text(450, 200, 'Game Over', {
        font: '80px "Fugaz One", monospace',
        fill: '#ffa300'
    });
    gameOverText.anchor.setTo(0.5);
    gameOverText.stroke = '#7e2553';
    gameOverText.strokeThickness = 16;

    let finalScoreText = this.game.add.text(450, 300, this.score + ' PTS', {
        font: '30px "Fugaz One", monospace',
        fill: '#ffa300'
    });
    finalScoreText.anchor.setTo(0.5);
    finalScoreText.stroke = '#7e2553';
    finalScoreText.strokeThickness = 8;

    let restartText = this.game.add.text(450, 360, '- Play again -', {
        font: '30px "Fugaz One", monospace',
        fill: '#ffa300'
    });
    restartText.anchor.setTo(0.5);
    restartText.stroke = '#7e2553';
    restartText.strokeThickness = 8;
    restartText.inputEnabled = true;
    restartText.input.useHandCursor = true;
    restartText.events.onInputUp.add(function () {
      this._wrathOfGod();
    }, this);
};

PlayScene._spawnCloud = function () {
    let x = this.game.rnd.between(900, 1400);
    let y = this.game.rnd.between(30, 400);

    let cloud = this.clouds.getFirstExists(false);
    if (cloud) {
        cloud.reset(x, y);
    }
    else {
        cloud = new Cloud(this.game, x, y);
        this.clouds.add(cloud);
    }

    return cloud;
};

PlayScene._spawnExplosion = function (x, y) {
    let explosion = this.explosions.getFirstExists(false);
    if (explosion) {
        explosion.reset(x, y);
    }
    else {
        explosion = new Explosion(this.game, x, y);
        this.explosions.add(explosion);
    }

    return explosion;
};



module.exports = PlayScene;

},{"./sprites/cloud.js":5,"./sprites/enemy_crawler.js":7,"./sprites/enemy_fighter.js":8,"./sprites/explosion.js":9,"./sprites/ship.js":10,"./wave.js":11}],3:[function(require,module,exports){
'use strict';

const GRAVITY = 700;
const ATTACK = 10;

function Bomb(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'bomb');

    this.anchor.setTo(0.5, 0);

    this.game.physics.enable(this);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.reset(x, y);

    this.attack = ATTACK;
}

Bomb.prototype = Object.create(Phaser.Sprite.prototype);
Bomb.constructor = Bomb;

Bomb.prototype.reset = function (x, y) {
    Phaser.Sprite.prototype.reset.call(this, x, y);
    this.body.gravity.y = GRAVITY;
    this.body.velocity.y = GRAVITY / 2;
};

module.exports = Bomb;

},{}],4:[function(require,module,exports){
'use strict';

const MOVE_SPEED = 660;
const ATTACK = 1;

function Bullet(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'bullet');

    this.anchor.setTo(0, 0.5);

    this.game.physics.enable(this);
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.reset(x, y);

    this.attack = ATTACK;
}

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.constructor = Bullet;

Bullet.prototype.reset = function (x, y) {
    Phaser.Sprite.prototype.reset.call(this, x, y);
    this.body.velocity.x = MOVE_SPEED;
};

module.exports = Bullet;

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
'use strict';

const MAX_HEALTH = 10;
const MOVE_SPEED = 200;

const CrawlerBullet = require('./crawler_bullet.js');

function EnemyCrawler(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'enemy:crawler');

    this.animations.add('move', [0, 1, 2], 10);
    this.animations.add('hit', [4, 3], 10);

    this.anchor.setTo(0.5, 1);
    this.game.physics.enable(this);
    this.checkWorldBounds = true;

    this.reset(x, y);
}

// inherit from Phaser.Sprite
EnemyCrawler.prototype = Object.create(Phaser.Sprite.prototype);
EnemyCrawler.constructor = EnemyCrawler;

EnemyCrawler.prototype.reset = function (x, y) {
    Phaser.Sprite.prototype.reset.call(this, x, y, MAX_HEALTH);
    this.animations.play('move', null, true);

    this.body.velocity.x = -MOVE_SPEED;
    this.outOfBoundsKill = false;

    this.events.onEnterBounds.addOnce(function () {
        this.outOfBoundsKill = true;
    }, this);
};

EnemyCrawler.prototype.hit = function(energy) {
    this.damage(energy);
    this.flash();
};

EnemyCrawler.prototype.flash = function () {
    this.animations.play('hit').onComplete.addOnce(function () {
        this.animations.play('move', null, true);
    }, this);
};

EnemyCrawler.prototype.shoot = function (group, sfx) {
    let y = this.y - this.height;

    // spawn shot
    let shot = group.getFirstExists(false);
    if (shot) {
        shot.reset(this.x, y);
    }
    else {
        group.add(new CrawlerBullet(this.game, this.x, y));
    }
    sfx.play();
};


module.exports = EnemyCrawler;

},{"./crawler_bullet.js":6}],8:[function(require,module,exports){
'use strict';

const MOVE_SPEED = 375;
const FUZZY_EPSILON = 10;
const MAX_HEALTH = 2;

function EnemyFighter(game, x, y, path) {
    Phaser.Sprite.call(this, game, x, y, 'enemy:fighter');

    this.anchor.setTo(0.5);
    this.game.physics.enable(this);

    this.animations.add('move', [0], 1);
    this.animations.add('hit', [2, 1], 10);

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

},{}],9:[function(require,module,exports){
'use strict';

function Explosion(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'explosion');

    this.anchor.setTo(0.5, 0.5);
    this.animations.add('boom');

    this.reset(x, y);
}

// inherit from sprite
Explosion.prototype = Object.create(Phaser.Sprite.prototype);
Explosion.constructor = Explosion;

Explosion.prototype.reset = function (x, y) {
    Phaser.Sprite.prototype.reset.call(this, x, y);

    this.animations.play('boom', 10, false, true);
};


module.exports = Explosion;

},{}],10:[function(require,module,exports){
'use strict';

const Bullet = require('./bullet.js');
const Bomb = require('./bomb.js');

const MOVE_SPEED = {fighter: 360, bomber: 270};
const SHOT_TYPE = {fighter: Bullet, bomber: Bomb};
const SHOT_CADENCE = { fighter: 5, bomber: 3}; // shots / s

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


Ship.prototype.shoot = function (groups, sfxBank) {
    let group = groups[this.mode];

    if (this.elapsed - this.lastTimestamp > 1 / SHOT_CADENCE[this.mode]) {
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

        // update timestamp & play sound
        this.lastTimestamp = this.elapsed;
        sfxBank[this.mode].play();
    }
};

module.exports = Ship;

},{"./bomb.js":3,"./bullet.js":4}],11:[function(require,module,exports){
'use strict';

function Wave(enemyClass, positions, path) {
    this.enemyClass = enemyClass;
    this.positions = positions;
    this.path = path;
}

Wave.prototype.spawn = function (group, x, y) {
    this.positions.forEach(function (position) {
        let enemy = group.getFirstExists(false);
        if (enemy) {
            enemy.reset(x + position.x, y + position.y, this.path);
        }
        else {
            group.add(new this.enemyClass(
                group.game, x + position.x, y + position.y, this.path));
        }
    }.bind(this));
};

module.exports = Wave;

},{}]},{},[1]);
