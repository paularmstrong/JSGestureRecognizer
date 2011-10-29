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
