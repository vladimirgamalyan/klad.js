/*global klad:false*/
/*global klad*/

klad.key = {

    pressed: {},
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    FIRE_LEFT: 81, // q
    FIRE_RIGHT: 87, // w

    isDown: function (keyCode) {
        "use strict";
        return this.pressed[keyCode];
    },

    onKeydown: function (event) {
        "use strict";
        this.pressed[event.keyCode] = true;
    },

    onKeyup: function (event) {
        "use strict";
        delete this.pressed[event.keyCode];
    },

    reset: function () {
        "use strict";
        this.pressed = {};
    }
};

window.addEventListener('keyup', function (event) {
    "use strict";
    klad.key.onKeyup(event);
}, false);

window.addEventListener('keydown', function (event) {
    "use strict";
    klad.key.onKeydown(event);
}, false);

window.onblur = function () {
    "use strict";
    klad.key.reset();
};
