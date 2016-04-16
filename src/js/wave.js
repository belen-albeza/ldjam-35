'use strict';

function Wave(enemyClass, positions, path) {
    this.enemyClass = enemyClass;
    this.positions = positions;
    this.path = path;
    console.log(this);
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
