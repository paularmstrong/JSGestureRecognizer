CreateRecognizer('swipe', {
    maxDuration: 1000,
    minDistance: 80,
    start: function (e) {
        if (e.touches.length !== this.touchCount) {
            this.invalidate();
            return;
        }

        var touch = e.touches[0];

        this.startX = touch.pageX;
        this.startY = touch.pageY;
        this.startTime = new Date();

        this.horizontal = false;
        this.vertical = false;

        this.validate();
    },
    move: function (e) {
        if (e.changedTouches.length < this.touchCount) {
            this.invalidate();
            return;
        }

        var touch = e.changedTouches[0],
            x = touch.pageX,
            y = touch.pageY,
            time = new Date(),
            deltaX = Math.abs(x - this.startX),
            deltaY = Math.abs(y - this.startY);

        if (time - this.startTime > this.maxDuration) {
            this.invalidate();
            return;
        }

        if (deltaX > this.minDistance) {
            this.horizontal = true;
            this.validate();
        }

        if (deltaY > this.minDistance) {
            this.vertical = true;
            this.validate();
        }

        if (!this.horizontal && !this.vertical) {
            this.invalidate();
        }
    },
    end: function (e) {
        this.move(e);

        var touch = e.changedTouches[0],
            x = touch.pageX,
            y = touch.pageY,
            deltaX = x - this.startX,
            deltaY = y - this.startY,
            direction,
            distance;

        if (this.vertical) {
            direction = (deltaY > this.minDistance) ? 'down' : 'up';
            distance = deltaY;
        } else if (this.horizontal) {
            direction = (deltaX > this.minDistance) ? 'right' : 'left';
            distance = deltaX;
        } else {
            return;
        }

        this.fire(e, {
            direction: direction,
            distance: distance,
            duration: (new Date()) - this.startTime
        });
        this.invalidate();
    }
});
