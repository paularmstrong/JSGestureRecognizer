CreateRecognizer('tap', {
    touchstart: function (e) {
        if (e.touches.length === 1) {
            this.shouldFire = true;
        } else {
            this.shouldFire = false;
        }
    },
    touchmove: function (e) {
        this.shouldFire = false;
    },
    touchend: function (e) {
        this.touchstart(e);
        this.fire(e);
    }
});
