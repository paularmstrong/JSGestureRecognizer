var rotate = CreateRecognizer('rotate', {
    rad: 180 / Math.PI,
    minTouches: 2,
    getAngle: function (touches) {
        var touch1 = touches[0],
            touch2 = touches[1],
            angle = Math.atan2(touch2.pageY - touch1.pageY, touch2.pageX - touch1.pageX) * this.rad;

        return (isNaN(angle)) ? 0 : angle;
    },
    start: function () {
        this.validate();
        this.isStarted = false;
    },
    move: function (e) {
        if (e.touches.length !== this.touchCount) {
            return;
        }

        var angle = this.getAngle(e.touches);

        if (!this.isStarted) {
            this.isStarted = true;
            this.startAngle = angle;
            this.fire(e, {
                angle: angle
            }, 'start');
        } else {
            this.fire(e, {
                angle: angle - this.startAngle
            });
        }
    },
    end: function (e) {
        if (!this.isStarted || e.changedTouches.length !== this.touchCount) {
            return;
        }

        var angle = this.getAngle(e.changedTouches);

        this.fire(e, {
            angle: angle
        }, 'end');
        this.isStarted = false;
    }
});
