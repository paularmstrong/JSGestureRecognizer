CreateRecognizer('tap', {
    start: function (e) {
        if (e.touches.length === this.touchCount) {
            this.validate();
        } else {
            this.invalidate();
        }
    },
    move: function (e) {
        this.invalidate();
    },
    end: function (e) {
        if (e.changedTouches.length !== this.touchCount) {
            this.invalidate();
        }
        this.fire(e);
    }
});
