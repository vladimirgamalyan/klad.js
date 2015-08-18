export function createMaze() {
    "use strict";

    var maze = {
        CELL_WIDTH: 8,
        CELL_HEIGHT: 8,
        SPACE: 0,
        BRICK: 1,
        LADDER: 2,
        BRIDGE: 3,
        WALL: 4,
        DOOR: 5,
        KLAD: 6,
        WATER: 7,
        KEY: 8,
        DOOR_OPENED: 9,
        BULLET: 34,
        UNDERWATER: 35,
        BRICK0: 36,
        BRICK1: 37,
        BRICK2: 38,
        BRICK_L0: 39,
        BRICK_L1: 40,
        BRICK_R0: 41,
        BRICK_R1: 42
    },
        MAP_WIDTH = 32,
        MAP_HEIGHT = 22,
        REGEN_INTERVAL = 180,
        keyFound = false,
        regenList = [],
        map,
        col,
        row;


    map = new Array(MAP_WIDTH);
    for (col = 0; col < MAP_WIDTH; col += 1) {
        map[col] = new Array(MAP_HEIGHT);
        for (row = 0; row < MAP_HEIGHT; row += 1) {
            map[col][row] = 0;
        }
    }

    maze.loadLevel = function (level, levels) {
        for (row = 0; row < MAP_HEIGHT; row += 1) {
            for (col = 0; col < MAP_WIDTH; col += 1) {
                map[col][row] = parseInt(levels[level].bitmap.charAt(col + row * MAP_WIDTH), 10);
            }
        }
        keyFound = false;
        regenList = [];
    };

    maze.render = function (ctx, images) {
        var p,
            img;
        for (row = 0; row < MAP_HEIGHT; row += 1) {
            for (col = 0; col < MAP_WIDTH; col += 1) {
                p = map[col][row];
                if ((p === this.WATER) && (row > 0)) {
                    if ((map[col][row - 1] === this.WATER) || (map[col][row - 1] === this.WALL)) {
                        p = this.UNDERWATER;
                    }
                }
                // FIXME: always draw the chest on the map, replace to key after find it.
                if ((p === this.KEY) && (!keyFound)) {
                    p = this.KLAD;
                }

                switch (p) {
                case this.SPACE:
                    img = images.space;
                    break;
                case this.BRICK:
                    img = images.brick;
                    break;
                case this.LADDER:
                    img = images.lestnica;
                    break;
                case this.BRIDGE:
                    img = images.most;
                    break;
                case this.WALL:
                    img = images.wall;
                    break;
                case this.DOOR:
                    img = images.door;
                    break;
                case this.KLAD:
                    img = images.klad;
                    break;
                case this.WATER:
                    img = images.water;
                    break;
                case this.KEY:
                    img = images.key;
                    break;
                case this.DOOR_OPENED:
                    img = images.opendoor;
                    break;
                case this.UNDERWATER:
                    img = images.wateru;
                    break;
                case this.BRICK0:
                    img = images.brick0;
                    break;
                case this.BRICK1:
                    img = images.brick1;
                    break;
                case this.BRICK2:
                    img = images.brick2;
                    break;
                case this.BRICK_L0:
                    img = images.brickL0;
                    break;
                case this.BRICK_L1:
                    img = images.brickL1;
                    break;
                case this.BRICK_R0:
                    img = images.brickR0;
                    break;
                case this.BRICK_R1:
                    img = images.brickR1;
                    break;
                }
                if (img) {
                    ctx.drawImage(img, col * this.CELL_WIDTH, row * this.CELL_HEIGHT);
                }
            }
        }
    };

    maze.setKeyFound = function () {
        keyFound = true;
    };

    maze.get = function (col, row) {
        return map[col][row];
    };

    maze.set = function (col, row, value) {
        map[col][row] = value;
    };

    maze.wallRegen = function () {
        var i,
            t;
        for (i = regenList.length - 1; i >= 0; i -= 1) {
            regenList[i].timer += 1;
            t = -1;
            switch (regenList[i].timer) {
            case REGEN_INTERVAL:
                t = this.BRICK0;
                break;
            case REGEN_INTERVAL * 2:
                t = this.BRICK1;
                break;
            case REGEN_INTERVAL * 3:
                t = this.BRICK2;
                break;
            case REGEN_INTERVAL * 4:
                t = this.BRICK;
                break;
            }
            if (t >= 0) {
                map[regenList[i].x][regenList[i].y] = t;
            }
            if (regenList[i].timer >= REGEN_INTERVAL * 4) {
                regenList.splice(i, 1);
            }
        }
    };

    maze.shot = function (col, row, fromRight) {

        var t,
            p;

        if ((col < 0) || (col >= MAP_WIDTH)) {
            return false;
        }

        p = map[col][row];

        if (this.antiBullet(p)) {
            return false;
        }

        if (!this.isBrick(p)) {
            return true;
        }

        t = this.SPACE;
        if (fromRight) {
            if (p === this.BRICK) {
                t = this.BRICK_L0;
            } else if ((p === this.BRICK_L0) || (p === this.BRICK_R0)) {
                t = this.BRICK_L1;
            }
        } else {
            if (p === this.BRICK) {
                t = this.BRICK_R0;
            } else if ((p === this.BRICK_L0) || (p === this.BRICK_R0)) {
                t = this.BRICK_R1;
            }
        }

        map[col][row] = t;
        if (t === this.SPACE) {
            regenList.push({x: col, y: row, timer: 0});
        }
    };

    maze.isSpace = function (p) {
        return ((p === this.SPACE) || (p === this.BRICK0) || (p === this.BRICK1) || (p === this.BRICK2));
    };

    maze.isBrick = function (p) {
        return ((p === this.BRICK) || (p === this.BRICK_L0) || (p === this.BRICK_L1) || (p === this.BRICK_R0) || (p === this.BRICK_R1));
    };

    maze.antiBullet = function (p) {
        return ((p === this.WALL) || (p === this.WATER) || (p === this.UNDERWATER) || (p === this.DOOR));
    };

    return maze;
}
