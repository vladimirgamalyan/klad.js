import { createMaze } from './maze';
import { Bullet } from './bullet';
import { Human } from './human';
import { createImages } from './img';
import { Keys } from './keys';
import { levels } from './levels';

const GAME_MODE_LOSE = 1;
const GAME_MODE_GAME = 2;
const GAME_MODE_FINISH = 3;

export class Klad {

    constructor(context) {
        var that = this;
        document.addEventListener('DOMContentLoaded', function () {
            that.run(context);
        });
    }

    run(context) {
        this.gameMode = GAME_MODE_GAME;
        this.currentLevel = 0;
        this.ctx = context.getElementById('canvas').getContext('2d');
        this.delayUpdate = 0;
        this.delayUpdateAliens = 0;
        this.maze = createMaze();
        this.player = new Human(false, this.maze);
        this.alien = new Human(true, this.maze);
        this.alien1 = null;
        this.bullet = new Bullet(this.maze);
        this.images = createImages();
        this.keys = new Keys(context);

        this.ctx.scale(2, 2);
        this.restartLevel();
        requestAnimationFrame(this.frame.bind(this));
    }
    
    restartLevel() {
        this.maze.loadLevel(this.currentLevel, levels);
        this.bullet = new Bullet(this.maze);
        this.player.resetFinished();
        this.player.respawn(levels[this.currentLevel].player.x, levels[this.currentLevel].player.y);
        this.player.resetKeyFound();
        this.alien.respawn(levels[this.currentLevel].aliens[0].x, levels[this.currentLevel].aliens[0].y);
        this.alien1 = null;
        if (levels[this.currentLevel].aliens[1]) {
            this.alien1 = new Human(true, this.maze);
            this.alien1.respawn(levels[this.currentLevel].aliens[1].x, levels[this.currentLevel].aliens[1].y);
        }
    }

    updateLose() {
        if (this.delayUpdate < 60) {
            this.delayUpdate += 1;
            return;
        }
        this.gameMode = GAME_MODE_GAME;
        restartLevel();
    }

    updateFinish() {
        if (this.delayUpdate < 30) {
            this.delayUpdate += 1;
            return;
        }
        this.gameMode = GAME_MODE_GAME;
        this.currentLevel += 1;
        if (this.currentLevel >= 5) {
            this.currentLevel = 0;
        }
        restartLevel();
    }

    updateGame() {
        this.delayUpdate += 1;
        if (this.delayUpdate < 2) {
            return;
        }
        this.delayUpdate = 0;

        this.delayUpdateAliens += 1;
        if (this.delayUpdateAliens > 2) {
            this.delayUpdateAliens = 0;
        } else {
            this.alien.moveToHuman(this.player);
            if (this.alien1) {
                this.alien1.moveToHuman(this.player);
            }
        }

        let caught = this.player.caught(this.alien);
        if (this.alien1) {
            if (this.alien1.caught(this.player)) {
                caught = true;
            }
        }

        if (caught) {
            this.player.kill();
            this.alien.kill();
            if (this.alien1) {
                this.alien1.kill();
            }
        }

        this.bullet.move();
        this.maze.wallRegen();

        this.player.move(this.keys.isLeft(), this.keys.isRight(),
            this.keys.isUp(), this.keys.isDown());

        if (this.keys.isFireLeft()) {
            this.bullet.shotLeft(this.player.getPos());
        }
        if (this.keys.isFireRight()) {
            this.bullet.shotRight(this.player.getPos());
        }

        if (this.player.isFinished()) {
            this.gameMode = GAME_MODE_FINISH;
            return;
        }

        if (this.player.isDead()) {
            this.gameMode = GAME_MODE_LOSE;
        }
    }

    update() {
        switch (this.gameMode) {
            case GAME_MODE_LOSE:
                this.updateLose();
                break;
            case GAME_MODE_GAME:
                this.updateGame();
                break;
            case GAME_MODE_FINISH:
                this.updateFinish();
                break;
        }
    }

    render() {
        this.maze.render(this.ctx, this.images);
        this.player.render(this.ctx, this.images);
        this.alien.render(this.ctx, this.images);
        if (this.alien1) {
            this.alien1.render(this.ctx, this.images);
        }
        this.bullet.render(this.ctx, this.images);
    }

    frame() {
        this.update();
        this.render();
        requestAnimationFrame(this.frame.bind(this));
    }
}
