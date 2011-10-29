var pinch = CreateRecognizer('pinch', {
    getDistance: function (touches) {
        var touch1 = touches[0],
            touch2 = touches[1],
            distance = Math.sqrt(Math.pow((touch2.pageX - touch1.pageX), 2) + Math.pow((touch2.pageY - touch1.pageY), 2));

        return (isNaN(distance)) ? 0 : distance;
    },
    touchstart: function (e) {
        this.shouldFire = true;
        this.isStarted = false;
    },
    touchmove: function (e) {
        if (e.touches.length !== 2) {
            return;
        }

        var distance = this.getDistance(e.touches);

        if (distance === 0) {
            return;
        }

        if (!this.isStarted) {
            this.isStarted = true;
            this.startDistance = distance;
        } else {
            this.fire(e, {
                distance: distance,
                scale: distance / this.startDistance
            });
        }
    },
    touchend: function (e) {
        if (!this.isStarted || e.changedTouches.length !== 2) {
            return;
        }

        this.isStarted = false;
    }
});

CreateRecognizer('pinchstart', {
    getDistance: pinch.prototype.getDistance,
    touchstart: pinch.prototype.touchstart,
    touchmove: function (e) {
        if (this.isStarted || e.touches.length !== 2) {
            return;
        }

        var distance = this.getDistance(e.touches);

        if (distance === 0) {
            return;
        }

        this.isStarted = true;
        this.startDistance = distance;

        this.fire(e, {
            distance: distance,
            scale: 1
        });
    },
    touchend: function (e) {
        if (!this.isStarted || e.changedTouches.length !== 2) {
            return;
        }

        this.isStarted = false;
    }
});
CreateRecognizer('pinchend', {
    getDistance: pinch.prototype.getDistance,
    touchstart: pinch.prototype.touchstart,
    touchmove: function (e) {
        if (e.touches.length !== 2) {
            return;
        }

        var distance = this.getDistance(e.touches);

        if (distance === 0) {
            return;
        }

        this.startDistance = distance;
        this.isStarted = true;
    },
    touchend: function (e) {
        if (!this.isStarted || e.changedTouches.length !== 2) {
            return;
        }

        var distance = this.getDistance(e.changedTouches);

        this.fire(e, {
            distance: distance,
            scale: distance / this.startDistance
        });

        this.isStarted = false;
    }
});
