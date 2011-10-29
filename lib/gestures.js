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

function normalizeEventName(name) {
    if (typeof document.createTouch !== 'undefined') {
        return name;
    }

    switch (name) {
    case 'touchstart':
        return 'mousedown';
    case 'touchmove':
        return 'mousemove';
    case 'touchend':
        return 'mouseup';
    default:
        return name;
    }
}

function normalizeEvent(e) {
    if (typeof document.createTouch !== 'undefined') {
        return;
    }

    e.changedTouches = [{ pageX: e.pageX, pageY: e.pageY }];
    e.touches = [{ pageX: e.pageX, pageY: e.pageY }];
}

JSGestureRecognizer = function (target, touchCount) {
    this.target = target;
    this.touchCount = touchCount;
    this.init();
};
JSGestureRecognizer.prototype = {
    timer: null,
    cancels: [],

    listeners: [],
    shouldFire: false,
    init: function () {},

    _start: function (e) {
        this.isTracking = true;
        normalizeEvent(e);
        this.start(e);
    },
    _move: function (e) {
        if (!this.isTracking) {
            return;
        }

        normalizeEvent(e);
        this.move(e);
    },
    _end: function (e) {
        this.isTracking = false;
        normalizeEvent(e);
        this.end(e);
    },

    start: function () {},
    move: function () {},
    end: function () {},

    invalidate: function () {
        this.shouldFire = false;
        clearTimeout(this.timer);
        this.timer = null;
    },

    validate: function () {
        this.shouldFire = true;
    },

    addListeners: function (types) {
        var l = types.length,
            i = 0,
            type,
            oType,
            cb;
        for (; i < l; i += 1) {
            oType = types[i];
            type = normalizeEventName(oType);
            cb = this['_' + oType.replace(/^touch/, '')].bind(this);
            this.listeners.push({ type: oType, cb: cb });
            this.target.__addEventListener(type, cb, false);
        }
    },

    fire: function (e, custom, suffix) {
        if (!this.shouldFire) {
            return;
        }

        var evt = document.createEvent('Events'),
            name = (suffix) ? this.name + suffix : this.name,
            gesture,
            i = 0;

        for (gesture in this.target.__recognizers) {
            if (this.target.__recognizers.hasOwnProperty(gesture) && this.cancels.indexOf(gesture) !== -1) {
                gesture = this.target.__recognizers[gesture];
                i = gesture.length;
                while (i) {
                    i -= 1;
                    gesture[i].recognizer.invalidate();
                }
            }
        }

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
    recognizers[name] = function (target, touchCount) {
        this.target = target;
        this.touchCount = (touchCount < this.minTouches) ? this.minTouches : touchCount;
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

function findOthers(type, nType, touchCount, el) {
    var types = [nType, nType + 'start', nType + 'end'],
        l = types.length,
        i = 0,
        n,
        etype;

    for (; i < l; i += 1) {
        etype = types[i];

        if (type === etype) {
            continue;
        }

        if (el.__recognizers.hasOwnProperty(etype) && el.__recognizers[etype].length) {
            n = el.__recognizers[etype].length;
            while (n) {
                n -= 1;
                if (el.__recognizers[etype][n].touches === touchCount) {
                    return el.__recognizers[etype][n];
                }
            }
        }
    }
    return null;
}

function getType(type) {
    return type.replace(/\:\d+$/, '');
}

function getNormalizedType(type) {
    return getType(type.replace(/start(\:\d+)?$|end(\:\d+)?$/, ''));
}

function getTouchCount(type) {
    var match = type.match(/\:(\d+)$/);
    return (match && match.length) ? parseInt(match[1], 10) : 1;
}

HTMLElement.prototype.__addEventListener = HTMLElement.prototype.addEventListener;
HTMLElement.prototype.__removeEventListener = HTMLElement.prototype.removeEventListener;
HTMLElement.prototype.addEventListener = function (type, listener, useCapture) {
    var nType = getNormalizedType(type),
        touchCount = getTouchCount(type),
        listened;

    type = getType(type);

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
        listened = findOthers(type, nType, touchCount, this);

        if (!listened) {
            this.__recognizers[type].push({ type: type, touches: touchCount, recognizer: new recognizers[nType](this, touchCount), cb: listener });
        } else {
            this.__recognizers[type].push({ type: type, touches: touchCount, recognizer: listened.recognizer, cb: listener });
        }
    }

    return this.__addEventListener(type, listener, useCapture);
};

HTMLElement.prototype.removeEventListener = function (type, listener, useCapture) {
    var nType = getNormalizedType(type),
        touchCount = getTouchCount(type),
        i,
        obj;

    type = getType(type);

    if (this.__recognizers && this.__recognizers.hasOwnProperty(nType)) {
        i = this.__recognizers[nType].length;
        while (i) {
            i -= 1;
            obj = this.__recognizers[nType][i];
            if ((!listener || (obj.cb === listener)) && !findOthers(type, nType, touchCount, this)) {
                this.__recognizers[type][i].recognizer.removeListeners();
                delete this.__recognizers[type][i];
            }
        }
    }

    return this.__removeEventListener(type, listener, useCapture);
};
