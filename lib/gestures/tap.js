CreateRecognizer('tap', {
    touchstart: function (e) {
        this.shouldFire = true;
    },
    touchmove: function (e) {
        this.shouldFire = false;
    },
    touchend: function (e) {
        this.fire(e);
    }
});
