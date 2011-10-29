var JSGestureRecognizer,
    recognizers = {};

JSGestureRecognizer = function (target) {
    this.target = target;
    this.init();
};
JSGestureRecognizer.prototype = {
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

    fire: function (e, custom, suffix) {
        if (!this.shouldFire) {
            return;
        }

        var evt = document.createEvent('Events'),
            name = (suffix) ? this.name + suffix : this.name;

        evt.initEvent(name, true, true, e);
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
    _.extend(recognizers[name].prototype, proto, { name: name });
    return recognizers[name];
};

function findOthers(type, nType, el) {
    var types = [nType, nType + 'start', nType + 'end'],
        other;
    other = _.find(types, function (etype) {
        if (type === etype) {
            return;
        }
        if (el.__recognizers.hasOwnProperty(etype) && el.__recognizers[etype].length) {
            return true;
        }
    });
    return other ? other[0] : null;
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
            }
        }
    }

    return this.__removeEventListener(type, listener, useCapture);
};
