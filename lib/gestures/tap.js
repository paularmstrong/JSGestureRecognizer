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
        if (e.changedTouches.length !== 1) {
            this.shouldFire = false;
        }
        this.fire(e);
    }
});
