CreateRecognizer('swipe', {
    maxDuration: 1000,
    minDistance: 80,
    touchstart: function (e) {
        if (e.changedTouches.length > 1) {
            this.shouldFire = false;
            return;
        }

        var touch = e.changedTouches[0];

        this.startX = touch.pageX;
        this.startY = touch.pageY;
        this.startTime = new Date();

        this.horizontal = false;
        this.vertical = false;

        this.shouldFire = true;
    },
    touchmove: function (e) {
        if (e.changedTouches.length > 1) {
            this.shouldFire = false;
            return;
        }

        var touch = e.changedTouches[0],
            x = touch.pageX,
            y = touch.pageY,
            time = new Date(),
            deltaX = Math.abs(x - this.startX),
            deltaY = Math.abs(y - this.startY);

        if (time - this.startTime > this.maxDuration) {
            this.shouldFire = false;
            return;
        }

        if (deltaX > this.minDistance) {
            this.horizontal = true;
            this.shouldFire = true;
        }

        if (deltaY > this.minDistance) {
            this.vertical = true;
            this.shouldFire = true;
        }

        if (!this.horizontal && !this.vertical) {
            this.shouldFire = false;
        }
    },
    touchend: function (e) {
        this.touchmove(e);

        var touch = e.changedTouches[0],
            x = touch.pageX,
            y = touch.pageY,
            deltaX = x - this.startX,
            deltaY = y - this.startY,
            direction,
            distance;

        if (this.vertical) {
            direction = (Math.abs(deltaY) > this.minDistance) ? 'down' : 'up';
            distance = deltaY;
        } else if (this.horizontal) {
            direction = (Math.abs(deltaX) > this.minDistance) ? 'right' : 'left';
            distance = deltaX;
        } else {
            return;
        }

        this.fire(e, {
            direction: direction,
            distance: distance,
            duration: (new Date()) - this.startTime
        });
        this.shouldFire = false;
    }
});
