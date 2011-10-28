HTMLElement.prototype.__addEventListener = HTMLElement.prototype.addEventListener;
HTMLElement.prototype.__removeEventListener = HTMLElement.prototype.removeEventListener;

var GestureRecognizer,
    TapRecognizer,
    DoubleTapRecognizer,
    SwipeRecognizer;

_.mixin({
    inherits: (function () {
        function noop() {}

        function ecma3(ctor, superCtor) {
            noop.prototype = superCtor.prototype;
            ctor.prototype = new noop();
            ctor.prototype.constructor = superCtor;
        }

        function ecma5(ctor, superCtor) {
            ctor.prototype = Object.create(superCtor.prototype, {
                constructor: { value: ctor, enumerable: false }
            });
        }

        return Object.create ? ecma5 : ecma3;
    }())
});

GestureRecognizer = function (target) {
    this.target = target;
    this.listeners = [];
    this.shouldFire = true;
    this.init();
};
GestureRecognizer.prototype = {
    init: function () {},

    addListener: function (type) {
        var cb = _.bind(this[type], this);
        this.listeners.push({ type: type, cb: cb });
        this.target.__addEventListener(type, cb, false);
    },

    fire: function (e, custom) {
        if (this.shouldFire) {
            var evt = document.createEvent('Events');
            e.type = this.name;
            evt.initEvent(this.name, true, true, e);
            _.extend(evt, custom || {});
            this.target.dispatchEvent(evt);
        }
    },

    remove: function () {
        var i = this.listeners.length,
            listener;
        while (i) {
            i -= 1;
            listener = this.listeners[i];
            this.target.__removeEventListener(listener.type, listener.cb, false);
        }
    }
};

TapRecognizer = function (target) {
    this.target = target;
    this.listeners = [];
    this.shouldFire = true;
    this.init();
};
_.inherits(TapRecognizer, GestureRecognizer);
_.extend(TapRecognizer.prototype, {
    init: function () {
        this.name = 'tap';
        this.addListener('touchstart');
        this.addListener('touchmove');
        this.addListener('touchend');
    },
    touchstart: function (e) {
        this.shouldFire = true;
    },
    touchmove: function (e) {
        this.shouldFire = false;
    },
    touchend: function (e) {
        this.fire(e);
    }
});

DoubleTapRecognizer = function (target) {
    this.target = target;
    this.listeners = [];
    this.shouldFire = true;
    this.init();
};
_.inherits(DoubleTapRecognizer, GestureRecognizer);
_.extend(DoubleTapRecognizer.prototype, {
    init: function () {
        this.name = 'doubletap';
        this.taps = 0;
        this.timer = null;
        this.addListener('touchstart');
        this.addListener('touchmove');
        this.addListener('touchend');
    },
    touchstart: function (e) {
        this.shouldFire = true;
        if (!this.timer) {
            this.timer = setTimeout(function () {}, 600);
        }
        this.taps += 1;
    },
    touchmove: function (e) {
        this.shouldFire = false;
        this.timer = null;
        this.taps = 0;
    },
    touchend: function (e) {
        if (this.taps < 2) {
            return;
        }

        if (!this.timer) {
            this.shouldFire = false;
            this.taps = 0;
            return;
        }

        if (this.taps >= 2 && this.timer) {
            this.shouldFire = true;
            this.taps = 0;
            this.timer = null;
        }

        this.fire(e);
    }
});

SwipeRecognizer = function (target) {
    this.target = target;
    this.listeners = [];
    this.shouldFire = true;
    this.init();
};
_.inherits(SwipeRecognizer, GestureRecognizer);
_.extend(SwipeRecognizer.prototype, {
    maxDuration: 1000,
    minDistance: 80,
    init: function () {
        this.name = 'swipe';
        this.taps = 0;
        this.timer = null;
        this.addListener('touchstart');
        this.addListener('touchmove');
        this.addListener('touchend');
    },
    touchstart: function (e) {
        if (e.changedTouches.length > 1) {
            this.shouldFire = false;
            return;
        }

        var touch = e.changedTouches[0];

        this.startX = touch.pageX;
        this.startY = touch.pageY;
        this.startTime = new Date();

        this.horizontal = true;
        this.vertical = true;
    },
    touchmove: function (e) {
        if (e.changedTouches.length > 1) {
            this.shouldFire = false;
            return;
        }

        var touch = e.changedTouches[0],
            x = touch.pageX,
            y = touch.pageY,
            time = new Date(),
            deltaX = Math.abs(x - this.startX),
            deltaY = Math.abs(y - this.startY);

        if (time - this.startTime > this.maxDuration) {
            this.shouldFire = false;
            return;
        }

        if (deltaX > this.minDistance) {
            this.vertical = false;
        }

        if (deltaY > this.minDistance) {
            this.horizontal = false;
        }

        if (!this.horizontal && !this.vertical) {
            this.shouldFire = false;
        }
    },
    touchend: function (e) {
        this.touchmove(e);

        var touch = e.changedTouches[0],
            x = touch.pageX,
            y = touch.pageY,
            deltaX = x - this.startX,
            deltaY = y - this.startY,
            direction,
            distance;

        if (this.vertical) {
            direction = (Math.abs(deltaY) > this.minDistance) ? 'down' : 'up';
            distance = deltaY;
        } else if (this.horizontal) {
            direction = (Math.abs(deltaX) > this.minDistance) ? 'right' : 'left';
            distance = deltaX;
        } else {
            return;
        }

        this.fire(e, {
            direction: direction,
            distance: distance,
            duration: (new Date()) - this.startTime
        });
    }
});

HTMLElement.prototype.addEventListener = function (type, listener, useCapture) {
    if (!this.__recognizers) {
        this.__recognizers = {};
    }

    if (!this.__recognizers.hasOwnProperty(type)) {
        this.__recognizers[type] = [];
    }

    switch (type) {
    case 'tap':
        this.__recognizers[type].push({ recognizer: new TapRecognizer(this), cb: listener });
        break;
    case 'doubletap':
        this.__recognizers[type].push({ recognizer: new DoubleTapRecognizer(this), cb: listener });
        break;
    case 'swipe':
        this.__recognizers[type].push({ recognizer: new SwipeRecognizer(this), cb: listener });
        break;
    default:
        break;
    }
    return this.__addEventListener(type, listener, useCapture);
};

HTMLElement.prototype.removeEventListener = function (type, listener, useCapture) {
    if (this.__recognizers && this.__recognizers.hasOwnProperty(type)) {
        var i = this.__recognizers[type].length;
        while (i) {
            i -= 1;
            if (!listener || this.__recognizers[type][i].cb === listener) {
                this.__recognizers[type][i].recognizer.remove();
            }
        }
    }

    return this.__removeEventListener(type, listener, useCapture);
};
