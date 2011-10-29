/*! JSGestureRecognizer v0.1.0 http://paularmstrong.github.com/JSGestureRecognizer | http://paularmstrong.github.com/JSGestureRecognizer/license.html */
(function () {
var JSGestureRecognizer,
    recognizers = {};

if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
        var fSlice = Array.prototype.slice,
            aArgs = fSlice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP ? this : oThis || window, aArgs.concat(fSlice.call(arguments)));
            };

        fNOP.prototype = this.prototype;
        fBound.prototype = new fNOP();

        return fBound;
    };
}

function extend() {
    function ext(destination, source) {
        var prop;
        for (prop in source) {
            if (source.hasOwnProperty(prop)) {
                destination[prop] = source[prop];
            }
        }
    }
    ext(arguments["0"], arguments["1"]);
}

JSGestureRecognizer = function (target) {
    this.target = target;
    this.init();
};
JSGestureRecognizer.prototype = {
    listeners: [],
    shouldFire: true,

    init: function () {},

    start: function () {},
    move: function () {},
    end: function () {},

    addListeners: function (types) {
        var l = types.length,
            i = 0,
            type,
            cb;
        for (; i < l; i += 1) {
            type = types[i];
            cb = this[type.replace(/^touch/, '')].bind(this);
            this.listeners.push({ type: type, cb: cb });
            this.target.__addEventListener(type, cb, false);
        }
    },

    fire: function (e, custom, suffix) {
        if (!this.shouldFire) {
            return;
        }

        var evt = document.createEvent('Events'),
            name = (suffix) ? this.name + suffix : this.name;

        evt.initEvent(name, true, true, e);
        extend(evt, custom || {});
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

window.CreateRecognizer = function (name, proto) {
    recognizers[name] = function (target) {
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

    inherit(recognizers[name], JSGestureRecognizer);
    extend(recognizers[name].prototype, proto);
    recognizers[name].prototype.name = name;
    return recognizers[name];
};

function findOthers(type, nType, el) {
    var types = [nType, nType + 'start', nType + 'end'],
        l = types.length,
        i = 0,
        etype;

    for (; i < l; i += 1) {
        etype = types[i];

        if (type === etype) {
            continue;
        }

        if (el.__recognizers.hasOwnProperty(etype) && el.__recognizers[etype].length) {
            return el.__recognizers[etype][0];
        }
    }
    return null;
}

function getNormalizedType(type) {
    return type.replace(/start$|end$/, '');
}

HTMLElement.prototype.__addEventListener = HTMLElement.prototype.addEventListener;
HTMLElement.prototype.__removeEventListener = HTMLElement.prototype.removeEventListener;
HTMLElement.prototype.addEventListener = function (type, listener, useCapture) {
    var nType = getNormalizedType(type),
        listened;

    if (!this.__recognizers) {
        this.__recognizers = {};
    }

    if (!this.__recognizers.hasOwnProperty(nType)) {
        this.__recognizers[nType] = [];
    }
    if (!this.__recognizers.hasOwnProperty(type)) {
        this.__recognizers[type] = [];
    }

    if (recognizers.hasOwnProperty(nType)) {
        listened = findOthers(type, nType, this);

        if (!listened) {
            this.__recognizers[type].push({ type: type, recognizer: new recognizers[nType](this), cb: listener });
        } else {
            this.__recognizers[type].push({ type: type, recognizer: listened.recognizer, cb: listener });
        }
    }

    return this.__addEventListener(type, listener, useCapture);
};

HTMLElement.prototype.removeEventListener = function (type, listener, useCapture) {
    var nType = getNormalizedType(type),
        i,
        obj;

    if (this.__recognizers && this.__recognizers.hasOwnProperty(nType)) {
        i = this.__recognizers[nType].length;
        while (i) {
            i -= 1;
            obj = this.__recognizers[nType][i];
            if ((!listener || (obj.cb === listener)) && !findOthers(type, nType, this)) {
                this.__recognizers[type][i].recognizer.removeListeners();
                delete this.__recognizers[type][i];
            }
        }
    }

    return this.__removeEventListener(type, listener, useCapture);
};
CreateRecognizer('doubletap', {
    taps: 0,
    timer: null,
    clear: function () {
        this.shouldFire = false;
        this.taps = 0;
        clearTimeout(this.timer);
        this.timer = null;
    },
    start: function (e) {
        if (e.touches.length === 1) {
            this.shouldFire = true;
        } else {
            this.shouldFire = false;
            return;
        }

        this.taps += 1;

        if (!this.timer) {
            var self = this;
            this.timer = setTimeout(function () {
                this.clear();
            }.bind(this), 600);
        }
    },
    move: function (e) {
        this.clear();
    },
    end: function (e) {
        if (this.taps < 2) {
            return;
        }

        if (!this.timer) {
            this.shouldFire = false;
            this.taps = 0;
            return;
        }

        this.fire(e);

        if (this.shouldFire) {
            this.clear();
        }
    }
});
var pinch = CreateRecognizer('pinch', {
    getDistance: function (touches) {
        var touch1 = touches[0],
            touch2 = touches[1],
            distance = Math.sqrt(Math.pow((touch2.pageX - touch1.pageX), 2) + Math.pow((touch2.pageY - touch1.pageY), 2));

        return (isNaN(distance)) ? 0 : distance;
    },
    start: function (e) {
        this.shouldFire = true;
        this.isStarted = false;
    },
    move: function (e) {
        if (e.touches.length !== 2) {
            return;
        }

        var distance = this.getDistance(e.touches);

        if (distance === 0) {
            return;
        }

        if (!this.isStarted) {
            this.isStarted = true;
            this.startDistance = distance;
            this.fire(e, {
                distance: distance,
                scale: 1
            }, 'start');
        } else {
            this.fire(e, {
                distance: distance,
                scale: distance / this.startDistance
            });
        }
    },
    end: function (e) {
        if (!this.isStarted || e.changedTouches.length !== 2) {
            return;
        }

        var distance = this.getDistance(e.changedTouches);

        this.fire(e, {
            distance: distance,
            scale: distance / this.startDistance
        }, 'end');

        this.isStarted = false;
    }
});
var rotate = CreateRecognizer('rotate', {
    rad: 180 / Math.PI,
    getAngle: function (touches) {
        var touch1 = touches[0],
            touch2 = touches[1],
            angle = Math.atan2(touch2.pageY - touch1.pageY, touch2.pageX - touch1.pageX) * this.rad;

        return (isNaN(angle)) ? 0 : angle;
    },
    start: function () {
        this.shouldFire = true;
        this.isStarted = false;
    },
    move: function (e) {
        if (e.touches.length !== 2) {
            return;
        }

        var angle = this.getAngle(e.touches);

        if (!this.isStarted) {
            this.isStarted = true;
            this.startAngle = angle;
            this.fire(e, {
                angle: angle
            }, 'start');
        } else {
            this.fire(e, {
                angle: angle - this.startAngle
            });
        }
    },
    end: function (e) {
        if (!this.isStarted || e.changedTouches.length !== 2) {
            return;
        }

        var angle = this.getAngle(e.changedTouches);

        this.fire(e, {
            angle: angle
        }, 'end');
        this.isStarted = false;
    }
});
CreateRecognizer('swipe', {
    maxDuration: 1000,
    minDistance: 80,
    start: function (e) {
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
    move: function (e) {
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
    end: function (e) {
        this.move(e);

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
CreateRecognizer('tap', {
    start: function (e) {
        if (e.touches.length === 1) {
            this.shouldFire = true;
        } else {
            this.shouldFire = false;
        }
    },
    move: function (e) {
        this.shouldFire = false;
    },
    end: function (e) {
        if (e.changedTouches.length !== 1) {
            this.shouldFire = false;
        }
        this.fire(e);
    }
});
}());
