/*global klad:false*/
/*global klad*/

klad.createBullet = function (map) {
    "use strict";

    var LEFT = -1,
        RIGHT = 1,
        pos = {x: 0, y: 0},
        active = false,
        direction;

    return {
        getPos: function () {
            return pos;
        },

        render: function (ctx, images) {
            if (active) {
                ctx.drawImage(images.bullet, pos.x * map.CELL_WIDTH, pos.y * map.CELL_HEIGHT);
            }
        },

        shot: function (x, y, dir) {
            if (active) {
                return;
            }
            pos.x = Math.floor((x + 2) / 4);
            pos.y = Math.floor((y + 2) / 4);
            direction = dir;
            active = true;
        },

        shotLeft: function (pos) {
            this.shot(pos.x, pos.y, LEFT);
        },

        shotRight: function (pos) {
            this.shot(pos.x, pos.y, RIGHT);
        },

        move: function () {
            if (!active) {
                return;
            }
            if (direction === RIGHT) {
                pos.x += 1;
            } else {
                pos.x -= 1;
            }
            active = map.shot(pos.x, pos.y, direction === RIGHT);
        }
    };
};
