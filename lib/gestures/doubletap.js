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
            this.timer = setTimeout(_.bind(function () {
                this.clear();
            }, this), 600);
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
