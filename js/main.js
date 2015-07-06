/*global requestAnimationFrame:false,
 klad:false*/
/*global klad,
 requestAnimationFrame*/

document.addEventListener('DOMContentLoaded',
    function () {
        "use strict";

        var GAME_MODE_LOSE = 1,
            GAME_MODE_GAME = 2,
            GAME_MODE_FINISH = 3,
            gameMode = GAME_MODE_GAME,
            currentLevel = 0,
            ctx = document.getElementById('canvas').getContext('2d'),
            delayUpdate = 0,
            delayUpdateAliens = 0,
            maze = klad.createMaze(),
            player = klad.createHuman(false, maze),
            alien = klad.createHuman(true, maze),
            alien1 = null,
            bullet = klad.createBullet(maze),
            images = klad.createImages();

        function restartLevel() {
            maze.loadLevel(currentLevel, klad.levels);
            bullet = klad.createBullet(maze);
            player.resetFinished();
            player.respawn(klad.levels[currentLevel].player.x, klad.levels[currentLevel].player.y);
            player.resetKeyFound();
            alien.respawn(klad.levels[currentLevel].aliens[0].x, klad.levels[currentLevel].aliens[0].y);
            alien1 = null;
            if (klad.levels[currentLevel].aliens[1]) {
                alien1 = klad.createHuman(true, maze);
                alien1.respawn(klad.levels[currentLevel].aliens[1].x, klad.levels[currentLevel].aliens[1].y);
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

            player.move(klad.key.isDown(klad.key.LEFT),
                klad.key.isDown(klad.key.RIGHT),
                klad.key.isDown(klad.key.UP),
                klad.key.isDown(klad.key.DOWN));

            if (klad.key.isDown(klad.key.FIRE_LEFT)) {
                bullet.shotLeft(player.getPos());
            }
            if (klad.key.isDown(klad.key.FIRE_RIGHT)) {
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

        //ctx.scale(2, 2);
        restartLevel();
        requestAnimationFrame(frame);
    });
