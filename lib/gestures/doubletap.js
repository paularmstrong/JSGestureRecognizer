CreateRecognizer('doubletap', {
    taps: 0,
    timer: null,
    touchstart: function (e) {
        if (e.touches.length === 1) {
            this.shouldFire = true;
        } else {
            this.shouldFire = false;
            return;
        }

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
