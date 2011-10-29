var rotate = CreateRecognizer('rotate', {
    rad: 180 / Math.PI,
    getAngle: function (touches) {
        var touch1 = touches[0],
            touch2 = touches[1],
            angle = Math.atan2(touch2.pageY - touch1.pageY, touch2.pageX - touch1.pageX) * this.rad;

        return (isNaN(angle)) ? 0 : angle;
    },
    touchstart: function () {
        this.shouldFire = true;
        this.isStarted = false;
    },
    touchmove: function (e) {
        if (e.touches.length !== 2) {
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
    touchend: function (e) {
        if (!this.isStarted || e.changedTouches.length !== 2) {
            return;
        }

        var angle = this.getAngle(e.changedTouches);

        this.fire(e, {
            angle: angle
        }, 'end');
        this.isStarted = false;
    }
});
