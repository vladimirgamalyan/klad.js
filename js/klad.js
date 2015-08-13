import { createMaze } from './maze';
import { createBullet } from './bullet';
import { Human } from './human';
import { createImages } from './img';
import { kladKeys } from './keys';
import { levels } from './levels';

export class Klad {
    constructor(context) {
        context.addEventListener('DOMContentLoaded',
            function () {
                var GAME_MODE_LOSE = 1,
                    GAME_MODE_GAME = 2,
                    GAME_MODE_FINISH = 3,
                    gameMode = GAME_MODE_GAME,
                    currentLevel = 0,
                    ctx = context.getElementById('canvas').getContext('2d'),
                    delayUpdate = 0,
                    delayUpdateAliens = 0,
                    maze = createMaze(),
                    player = new Human(false, maze),
                    alien = new Human(true, maze),
                    alien1 = null,
                    bullet = createBullet(maze),
                    images = createImages();

                function restartLevel() {
                    maze.loadLevel(currentLevel, levels);
                    bullet = createBullet(maze);
                    player.resetFinished();
                    player.respawn(levels[currentLevel].player.x, levels[currentLevel].player.y);
                    player.resetKeyFound();
                    alien.respawn(levels[currentLevel].aliens[0].x, levels[currentLevel].aliens[0].y);
                    alien1 = null;
                    if (levels[currentLevel].aliens[1]) {
                        alien1 = new Human(true, maze);
                        alien1.respawn(levels[currentLevel].aliens[1].x, levels[currentLevel].aliens[1].y);
                    }
                }

                function updateLose() {
                    if (delayUpdate < 60) {
                        delayUpdate += 1;
                        return;
                    }
                    gameMode = GAME_MODE_GAME;
                    restartLevel();
                }

                function updateFinish() {
                    if (delayUpdate < 30) {
                        delayUpdate += 1;
                        return;
                    }
                    gameMode = GAME_MODE_GAME;
                    currentLevel += 1;
                    if (currentLevel >= 5) {
                        currentLevel = 0;
                    }
                    restartLevel();
                }

                function updateGame() {
                    delayUpdate += 1;
                    if (delayUpdate < 2) {
                        return;
                    }
                    delayUpdate = 0;

                    delayUpdateAliens += 1;
                    if (delayUpdateAliens > 2) {
                        delayUpdateAliens = 0;
                    } else {
                        alien.moveToHuman(player);
                        if (alien1) {
                            alien1.moveToHuman(player);
                        }
                    }

                    var caught = player.caught(alien);
                    if (alien1) {
                        if (alien1.caught(player)) {
                            caught = true;
                        }
                    }

                    if (caught) {
                        player.kill();
                        alien.kill();
                        if (alien1) {
                            alien1.kill();
                        }
                    }

                    bullet.move();
                    maze.wallRegen();

                    player.move(kladKeys.isDown(kladKeys.LEFT),
                        kladKeys.isDown(kladKeys.RIGHT),
                        kladKeys.isDown(kladKeys.UP),
                        kladKeys.isDown(kladKeys.DOWN));

                    if (kladKeys.isDown(kladKeys.FIRE_LEFT)) {
                        bullet.shotLeft(player.getPos());
                    }
                    if (kladKeys.isDown(kladKeys.FIRE_RIGHT)) {
                        bullet.shotRight(player.getPos());
                    }

                    if (player.isFinished()) {
                        gameMode = GAME_MODE_FINISH;
                        return;
                    }

                    if (player.isDead()) {
                        gameMode = GAME_MODE_LOSE;
                    }
                }

                function update() {
                    switch (gameMode) {
                        case GAME_MODE_LOSE:
                            updateLose();
                            break;
                        case GAME_MODE_GAME:
                            updateGame();
                            break;
                        case GAME_MODE_FINISH:
                            updateFinish();
                            break;
                    }
                }

                function render() {
                    maze.render(ctx, images);
                    player.render(ctx, images);
                    alien.render(ctx, images);
                    if (alien1) {
                        alien1.render(ctx, images);
                    }
                    bullet.render(ctx, images);
                }

                function frame() {
                    update();
                    render();
                    requestAnimationFrame(frame);
                }

                window.addEventListener('keyup', function (event) {
                    kladKeys.onKeyup(event);
                }, false);

                window.addEventListener('keydown', function (event) {
                    kladKeys.onKeydown(event);
                }, false);

                window.onblur = function () {
                    kladKeys.reset();
                };

                
                ctx.scale(2, 2);
                restartLevel();
                requestAnimationFrame(frame);
            });

    }
}
