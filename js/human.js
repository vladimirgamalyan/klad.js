export function createHuman(npc, map) {
    "use strict";

    var human = {},
        pos = { x: 4, y: 20 },
        respawnPos = { x: 4, y: 4 },
        alive = false,
        direction,
        LEFT = 1,
        RIGHT = 2,
        UP = 3,
        DOWN = 4,
        FLY = 5,
        RESPAWN_TIME = 300,
        keyFound = false,
        deathTimer = 0,
        finished = false;

    human.kill = function () {
        alive = false;
    };

    human.isDead = function () {
        return !alive;
    };

    // Distance to other human.
    human.getDistance = function (otherHuman) {
        return Math.floor(Math.sqrt(Math.pow(pos.x - otherHuman.getPos().x, 2) + Math.pow(pos.y - otherHuman.getPos().y, 2)));
    };

    human.isKeyFound = function () {
        return keyFound;
    };

    human.caught = function (otherHuman) {
        return (this.getDistance(otherHuman) < 3);
    };

    human.resetKeyFound = function () {
        keyFound = false;
    };

    human.freeSquare = function (x, y) {
        var p = map.get(x, y),
            result = map.isSpace(p) || (p === map.LADDER) || (p === map.KLAD) || (p === map.KEY) ||
                (p === map.DOOR_OPENED) || (p === map.BRIDGE);

        if (!npc) {
            if (p === map.KLAD) {
                map.set(x, y, map.SPACE);
            }
            if (p === map.KEY) {
                keyFound = true;
                map.setKeyFound();
            }
            if ((p === map.DOOR) && keyFound) {
                map.set(x, y, map.DOOR_OPENED);
                result = true;
            }
            if (y < 0) {
                finished = true;
            }
        }

        if ((p === map.WATER) && (pos.y % 4) === 2) {
            this.kill();
        }

        return result;
    };

    human.getPos = function () {
        return pos;
    };

    human.moveLeft = function () {
        if (((pos.x % 4) === 0) && (!this.freeSquare(Math.floor(pos.x / 4) - 1, Math.floor((pos.y + 2) / 4)))) {
            return false;
        }
        if ((pos.y % 4) !== 0) {
            if ((pos.y % 4) > 1) {
                return this.moveDown();
            }
            return this.moveUp();
        }
        pos.x -= 1;
        direction = LEFT;
        return true;
    };

    human.moveRight = function () {
        if (((pos.x % 4) === 0) && (!this.freeSquare(Math.floor(pos.x / 4) + 1, Math.floor((pos.y + 2) / 4)))) {
            return false;
        }
        if ((pos.y % 4) !== 0) {
            if ((pos.y % 4) > 1) {
                return this.moveDown();
            }
            return this.moveUp();
        }
        pos.x += 1;
        direction = RIGHT;
        return true;
    };

    human.moveUp = function () {
        var x = Math.floor((pos.x + 2) / 4),
            y = Math.floor(pos.y / 4);
        if (((pos.y % 4) === 0) && (!(this.freeSquare(x, y - 1) && (map.get(x, y) === map.LADDER)))) {
            return false;
        }
        if ((pos.x % 4) !== 0) {
            if (!npc) {
                if ((pos.x % 4) > 1) {
                    this.moveRight();
                } else {
                    this.moveLeft();
                }
            }
            return false;
        }
        pos.y -= 1;
        direction = UP;
        return true;
    };

    human.moveDown = function () {
        if (((pos.y % 4) === 0) && (!this.freeSquare(Math.floor((pos.x + 2) / 4), Math.floor(pos.y / 4) + 1) ||
            (map.get(Math.floor((pos.x + 2) / 4), Math.floor(pos.y / 4) + 1) === map.BRIDGE))) {
            return false;
        }
        if ((pos.x % 4) !== 0) {
            if (!npc) {
                if ((pos.x % 4) > 1) {
                    this.moveRight();
                } else {
                    this.moveLeft();
                }
            }
            return false;
        }
        pos.y += 1;
        direction = DOWN;
        return true;
    };

    human.render = function (ctx, images) {

        var pic = 8,
            img,
            HUMAN_SPRITES = [images.runner0, images.runner1, images.runner2, images.runner3,
                images.runner4, images.runner5, images.runner6, images.runner7,
                images.runner8, images.runner9,
                images.runner10, images.runner11, images.runner12, images.runner13,
                images.runner14, images.runner15, images.runner16, images.runner17,
                images.runner18, images.runner19];

        if ((direction === LEFT) || (direction === RIGHT)) {
            pic = pos.x % 4;
        }
        if (direction === LEFT) {
            pic += 4;
        }
        if ((direction === UP) || (direction === DOWN)) {
            pic = (pos.y % 2) + 8;
        }
        if (npc) {
            pic += 10;
        }
        img = HUMAN_SPRITES[pic];

        ctx.drawImage(img, pos.x * (map.CELL_WIDTH / 4), pos.y * (map.CELL_HEIGHT / 4));
    };

    human.respawn = function (x, y) {
        respawnPos.x = x;
        respawnPos.y = y;
        pos.x = respawnPos.x * 4;
        pos.y = respawnPos.y * 4;
        alive = true;
        deathTimer = 0;
    };

    human.freeFly = function () {
        var x = Math.floor((pos.x + 2) / 4),
            y = Math.floor(pos.y / 4),
            p,
            flying;

        this.freeSquare(x, y + 1);
        if (map.get(x, y) === map.LADDER) {
            return false;
        }
        p = map.get(x, y + 1);
        flying = (map.isSpace(p) || (p === map.WATER) || ((p === map.BRIDGE) && (direction === FLY)));
        if (!flying) {
            return false;
        }

        if ((pos.x % 4) !== 0) {
            if ((pos.x % 4) > 1) {
                this.moveRight();
            } else {
                this.moveLeft();
            }
        } else {
            pos.y += 1;
        }

        direction = FLY;
        return true;
    };

    human.isFinished = function () {
        return finished;
    };

    human.resetFinished = function () {
        finished = false;
    };

    human.moveToHuman = function (otherHuman) {
        var toLeft = false,
            toRight = false,
            toUp = false,
            toDown = false;

        if (otherHuman.getPos().x < this.getPos().x) {
            toLeft = true;
        }
        if (otherHuman.getPos().x > this.getPos().x) {
            toRight = true;
        }
        if (otherHuman.getPos().y > this.getPos().y) {
            toDown = true;
        }
        if (otherHuman.getPos().y < this.getPos().y) {
            toUp = true;
        }

        this.move(toLeft, toRight, toUp, toDown);
    };

    human.move = function (toLeft, toRight, toUp, toDown) {
        if (npc) {
            if (!alive) {
                deathTimer += 1;
                if (deathTimer >= RESPAWN_TIME) {
                    this.respawn(respawnPos.x, respawnPos.y);
                }
                return false;
            }
        }

        if (this.freeFly()) {
            return false;
        }

        var moved = false;
        if (toLeft) {
            if (this.moveLeft()) {
                moved = true;
            }
        }
        if (toRight) {
            if (this.moveRight()) {
                moved = true;
            }
        }

        if (!moved) {
            if (toUp) {
                this.moveUp();
            }
            if (toDown) {
                this.moveDown();
            }
        }

        if (map.get(Math.floor((pos.x + 2) / 4), Math.floor((pos.y + 2) / 4)) === map.BRICK)
		{
            this.kill();
        }

        return true;
    };

    return human;
}
