CreateRecognizer('doubletap', {
    taps: 0,
    invalidate: function () {
        this.shouldFire = false;
        clearTimeout(this.timer);
        this.timer = null;
        this.taps = 0;
    },
    start: function (e) {
        if (e.touches.length === 1) {
            this.validate();
        } else {
            this.invalidate();
            return;
        }

        this.taps += 1;

        if (this.timer === null) {
            var self = this;
            this.timer = setTimeout(function () {
                self.invalidate();
            }, 800);
        }
    },
    move: function (e) {
        this.invalidate();
    },
    end: function (e) {
        if (this.taps < 2) {
            return;
        }

        if (this.timer === null || this.taps > 2) {
            this.invalidate();
        }

        this.fire(e);
    }
});
