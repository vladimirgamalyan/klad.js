
export class Keys {

    constructor(context) {
        var that = this;
        that.pressed = {};

        context.addEventListener('keyup', function (event) {
            delete that.pressed[event.keyCode];
        }, false);

        context.addEventListener('keydown', function (event) {
            that.pressed[event.keyCode] = true;
        }, false);

        context.onblur = function () {
            that.reset.bind(that);
        };
    }

    isLeft() {
        return this.pressed[37];
    }

    isRight() {
        return this.pressed[39];
    }

    isUp() {
        return this.pressed[38];
    }

    isDown() {
        return this.pressed[40];
    }

    isFireLeft() {
        return this.pressed[81];
    }

    isFireRight() {
        return this.pressed[87];
    }
}
