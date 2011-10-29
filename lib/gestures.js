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
    timer: null,
    cancels: [],

    listeners: [],
    shouldFire: false,
    init: function () {},

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
