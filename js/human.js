
const LEFT = 1;
const RIGHT = 2;
const UP = 3;
const DOWN = 4;
const FLY = 5;
const RESPAWN_TIME = 300;

export class Human {

    constructor(npc, map) {
     
        this.npc = npc;
        this.map = map;
        this.pos = { x: 4, y: 20 };
        this.respawnPos = { x: 4, y: 4 };
        this.alive = false;
        this.direction = LEFT;
        this.keyFound = false;
        this.deathTimer = 0;
        this.finished = false;
    }

    kill() {
        this.alive = false;
    }

    isDead() {
        return !this.alive;
    }

    // Distance to other human.
    getDistance(otherHuman) {
        return Math.floor(Math.sqrt(Math.pow(this.pos.x - otherHuman.getPos().x, 2) + Math.pow(this.pos.y - otherHuman.getPos().y, 2)));
    }

    isKeyFound() {
        return this.keyFound;
    }

    caught(otherHuman) {
        return (this.getDistance(otherHuman) < 3);
    }

    resetKeyFound() {
        this.keyFound = false;
    }

    freeSquare(x, y) {
        let p = this.map.get(x, y);
        let result = this.map.isSpace(p) || (p === this.map.LADDER) || (p === this.map.KLAD) || (p === this.map.KEY) ||
                (p === this.map.DOOR_OPENED) || (p === this.map.BRIDGE);

        if (!this.npc) {
            if (p === this.map.KLAD) {
                this.map.set(x, y, this.map.SPACE);
            }
            if (p === this.map.KEY) {
                this.keyFound = true;
                this.map.setKeyFound();
            }
            if ((p === this.map.DOOR) && this.keyFound) {
                this.map.set(x, y, this.map.DOOR_OPENED);
                result = true;
            }
            if (y < 0) {
                this.finished = true;
            }
        }

        if ((p === this.map.WATER) && (this.pos.y % 4) === 2) {
            this.kill();
        }

        return result;
    };

    getPos() {
        return this.pos;
    }

    moveLeft() {
        if (((this.pos.x % 4) === 0) && (!this.freeSquare(Math.floor(this.pos.x / 4) - 1, Math.floor((this.pos.y + 2) / 4)))) {
            return false;
        }
        if ((this.pos.y % 4) !== 0) {
            if ((this.pos.y % 4) > 1) {
                return this.moveDown();
            }
            return this.moveUp();
        }
        this.pos.x -= 1;
        this.direction = LEFT;
        return true;
    }

    moveRight() {
        if (((this.pos.x % 4) === 0) && (!this.freeSquare(Math.floor(this.pos.x / 4) + 1, Math.floor((this.pos.y + 2) / 4)))) {
            return false;
        }
        if ((this.pos.y % 4) !== 0) {
            if ((this.pos.y % 4) > 1) {
                return this.moveDown();
            }
            return this.moveUp();
        }
        this.pos.x += 1;
        this.direction = RIGHT;
        return true;
    }

    moveUp() {
        let x = Math.floor((this.pos.x + 2) / 4);
        let y = Math.floor(this.pos.y / 4);
        if (((this.pos.y % 4) === 0) && (!(this.freeSquare(x, y - 1) && (this.map.get(x, y) === this.map.LADDER)))) {
            return false;
        }
        if ((this.pos.x % 4) !== 0) {
            if (!this.npc) {
                if ((this.pos.x % 4) > 1) {
                    this.moveRight();
                } else {
                    this.moveLeft();
                }
            }
            return false;
        }
        this.pos.y -= 1;
        this.direction = UP;
        return true;
    }

    moveDown() {
        if (((this.pos.y % 4) === 0) && (!this.freeSquare(Math.floor((this.pos.x + 2) / 4), Math.floor(this.pos.y / 4) + 1) ||
            (this.map.get(Math.floor((this.pos.x + 2) / 4), Math.floor(this.pos.y / 4) + 1) === this.map.BRIDGE))) {
            return false;
        }
        if ((this.pos.x % 4) !== 0) {
            if (!this.npc) {
                if ((this.pos.x % 4) > 1) {
                    this.moveRight();
                } else {
                    this.moveLeft();
                }
            }
            return false;
        }
        this.pos.y += 1;
        this.direction = DOWN;
        return true;
    }

    render(ctx, images) {
        let pic = 8;
        if ((this.direction === LEFT) || (this.direction === RIGHT)) {
            pic = this.pos.x % 4;
        }
        if (this.direction === LEFT) {
            pic += 4;
        }
        if ((this.direction === UP) || (this.direction === DOWN)) {
            pic = (this.pos.y % 2) + 8;
        }
        if (this.npc) {
            pic += 10;
        }

        const HUMAN_SPRITES = [images.runner0, images.runner1, images.runner2, images.runner3,
            images.runner4, images.runner5, images.runner6, images.runner7,
            images.runner8, images.runner9,
            images.runner10, images.runner11, images.runner12, images.runner13,
            images.runner14, images.runner15, images.runner16, images.runner17,
            images.runner18, images.runner19];
        let img = HUMAN_SPRITES[pic];

        ctx.drawImage(img, this.pos.x * (this.map.CELL_WIDTH / 4), this.pos.y * (this.map.CELL_HEIGHT / 4));
    }

    respawn(x, y) {
        this.respawnPos.x = x;
        this.respawnPos.y = y;
        this.pos.x = this.respawnPos.x * 4;
        this.pos.y = this.respawnPos.y * 4;
        this.alive = true;
        this.deathTimer = 0;
    }

    freeFly() {
        let x = Math.floor((this.pos.x + 2) / 4);
        let y = Math.floor(this.pos.y / 4);

        this.freeSquare(x, y + 1);
        if (this.map.get(x, y) === this.map.LADDER) {
            return false;
        }

        let p = this.map.get(x, y + 1);
        let flying = (this.map.isSpace(p) || (p === this.map.WATER) || ((p === this.map.BRIDGE) && (this.direction === FLY)));
        if (!flying) {
            return false;
        }

        if ((this.pos.x % 4) !== 0) {
            if ((this.pos.x % 4) > 1) {
                this.moveRight();
            } else {
                this.moveLeft();
            }
        } else {
            this.pos.y += 1;
        }

        this.direction = FLY;
        return true;
    }

    isFinished() {
        return this.finished;
    }

    resetFinished() {
        this.finished = false;
    }

    moveToHuman(otherHuman) {
        let toLeft = false;
        let toRight = false;
        let toUp = false;
        let toDown = false;

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
    }

    move(toLeft, toRight, toUp, toDown) {
        if (this.npc) {
            if (!this.alive) {
                this.deathTimer += 1;
                if (this.deathTimer >= RESPAWN_TIME) {
                    this.respawn(this.respawnPos.x, this.respawnPos.y);
                }
                return false;
            }
        }

        if (this.freeFly()) {
            return false;
        }

        let moved = false;
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

        if (this.map.get(Math.floor((this.pos.x + 2) / 4), Math.floor((this.pos.y + 2) / 4)) === this.map.BRICK) {
            this.kill();
        }

        return true;
    }
}
