CreateRecognizer('longpress', {
    minduration: 1000,
    maxMove: 3,
    timer: null,
    start: function (e) {
        if (e.touches.length === 1) {
            this.shouldFire = true;
        } else {
            this.shouldFire = false;
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

        if (touch.pageX - this.startPos.x < this.maxMove && touch.pageY - this.startPos.y < this.maxMove) {
            return;
        }

        this.shouldFire = false;
        clearTimeout(this.timer);
        this.timer = null;
    },
    end: function (e) {
        this.shouldFire = false;
        clearTimeout(this.timer);
        this.timer = null;
    }
});
