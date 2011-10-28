HTMLElement.prototype.__addEventListener = HTMLElement.prototype.addEventListener;
HTMLElement.prototype.__removeEventListener = HTMLElement.prototype.removeEventListener;

var GestureRecognizer,
    CreateRecognizer;

GestureRecognizer = function (target) {
    this.target = target;
    this.init();
};
GestureRecognizer.prototype = {
    listeners: [],
    shouldFire: true,

    init: function () {},

    touchstart: function () {},
    touchmove: function () {},
    touchend: function () {},

    addListeners: function (types) {
        _.each(types, function (type) {
            var cb = _.bind(this[type], this);
            this.listeners.push({ type: type, cb: cb });
            this.target.__addEventListener(type, cb, false);
        }, this);
    },

    fire: function (e, custom) {
        if (!this.shouldFire) {
            return;
        }

        var evt = document.createEvent('Events');
        e.type = this.name;
        evt.initEvent(this.name, true, true, e);
        _.extend(evt, custom || {});
        this.target.dispatchEvent(evt);
    },

    removeListeners: function () {
        var i = this.listeners.length,
            listener;
        while (i) {
            i -= 1;
            listener = this.listeners[i];
            this.target.__removeEventListener(listener.type, listener.cb, false);
        }
    }
};

CreateRecognizer = function (name, proto) {
    GestureRecognizer[name] = function (target) {
        this.target = target;
        this.init();
        this.addListeners(['touchstart', 'touchmove', 'touchend']);
    };

    function noop() {}
    function inherit(ctor, superCtor) {
        if (Object.create) {
            ctor.prototype = Object.create(superCtor.prototype, {
                constructor: { value: ctor, enumerable: false }
            });
        } else {
            noop.prototype = superCtor.prototype;
            ctor.prototype = new noop();
            ctor.prototype.constructor = superCtor;
        }
    }

    inherit(GestureRecognizer[name], GestureRecognizer);
    _.extend(GestureRecognizer[name].prototype, proto, { name: name });
    return GestureRecognizer[name];
};

CreateRecognizer('tap', {
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

CreateRecognizer('doubletap', {
    taps: 0,
    timer: null,
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

CreateRecognizer('swipe', {
    maxDuration: 1000,
    minDistance: 80,
    touchstart: function (e) {
        if (e.changedTouches.length > 1) {
            this.shouldFire = false;
            return;
        }

        var touch = e.changedTouches[0];

        this.startX = touch.pageX;
        this.startY = touch.pageY;
        this.startTime = new Date();

        this.horizontal = false;
        this.vertical = false;

        this.shouldFire = true;
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
            this.horizontal = true;
            this.shouldFire = true;
        }

        if (deltaY > this.minDistance) {
            this.vertical = true;
            this.shouldFire = true;
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
        this.shouldFire = false;
    }
});

HTMLElement.prototype.addEventListener = function (type, listener, useCapture) {
    if (!this.__recognizers) {
        this.__recognizers = {};
    }

    if (!this.__recognizers.hasOwnProperty(type)) {
        this.__recognizers[type] = [];
    }

    if (GestureRecognizer.hasOwnProperty(type)) {
        this.__recognizers[type].push({ recognizer: new GestureRecognizer[type](this), cb: listener });
    }

    return this.__addEventListener(type, listener, useCapture);
};

HTMLElement.prototype.removeEventListener = function (type, listener, useCapture) {
    if (this.__recognizers && this.__recognizers.hasOwnProperty(type)) {
        var i = this.__recognizers[type].length;
        while (i) {
            i -= 1;
            if (!listener || this.__recognizers[type][i].cb === listener) {
                this.__recognizers[type][i].recognizer.removeListeners();
            }
        }
    }

    return this.__removeEventListener(type, listener, useCapture);
};
