CreateRecognizer('longpress', {
    minduration: 1000,
    maxMove: 3,
    timer: null,
    cancels: ['tap'],
    start: function (e) {
        if (e.touches.length === this.touchCount) {
            this.validate();
        } else {
            this.invalidate();
        }

        this.target.style.webkitUserSelect = 'none';
        var self = this;

        this.startPos = { x: e.touches[0].pageX, y: e.touches[0].pageY };

        this.timer = setTimeout(function () {
            self.fire(e);
        }, this.minduration);
    },
    move: function (e) {
        var touch = e.changedTouches[0];

        if (Math.abs(touch.pageX - this.startPos.x) < this.maxMove && Math.abs(touch.pageY - this.startPos.y) < this.maxMove) {
            return;
        }

        this.invalidate();
    },
    end: function (e) {
        this.invalidate();
    }
});
