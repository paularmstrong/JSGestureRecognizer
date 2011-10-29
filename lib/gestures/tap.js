CreateRecognizer('tap', {
    start: function (e) {
        if (e.touches.length === 1) {
            this.validate();
        } else {
            this.invalidate();
        }
    },
    move: function (e) {
        this.invalidate();
    },
    end: function (e) {
        if (e.changedTouches.length !== 1) {
            this.invalidate();
        }
        this.fire(e);
    }
});
