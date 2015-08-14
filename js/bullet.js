
const LEFT = -1;
const RIGHT = 1;

export class Bullet {

    constructor(map) {
        this.map = map;
        this.active = false;
        this.direction = LEFT;
        this.pos = {x: 0, y: 0};
    }

    getPos() {
        return this.pos;
    }

    render(ctx, images) {
        if (this.active) {
            ctx.drawImage(images.bullet, this.pos.x * this.map.CELL_WIDTH, this.pos.y * this.map.CELL_HEIGHT);
        }
    }

    shot(x, y, dir) {
        if (this.active) {
            return;
        }
        this.pos.x = Math.floor((x + 2) / 4);
        this.pos.y = Math.floor((y + 2) / 4);
        this.direction = dir;
        this.active = true;
    }

    shotLeft(pos) {
        this.shot(pos.x, pos.y, LEFT);
    }

    shotRight(pos) {
        this.shot(pos.x, pos.y, RIGHT);
    }

    move() {
        if (!this.active) {
            return;
        }
        if (this.direction === RIGHT) {
            this.pos.x += 1;
        } else {
            this.pos.x -= 1;
        }
        this.active = this.map.shot(this.pos.x, this.pos.y, this.direction === RIGHT);
    }
}
