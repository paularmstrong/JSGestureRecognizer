var pinch = CreateRecognizer('pinch', {
    minTouches: 2,
    getDistance: function (touches) {
        var touch1 = touches[0],
            touch2 = touches[1],
            distance = Math.sqrt(Math.pow((touch2.pageX - touch1.pageX), 2) + Math.pow((touch2.pageY - touch1.pageY), 2));

        return (isNaN(distance)) ? 0 : distance;
    },
    start: function (e) {
        this.validate();
        this.isStarted = false;
    },
    move: function (e) {
        if (e.touches.length !== this.touchCount) {
            return;
        }

        var distance = this.getDistance(e.touches);

        if (distance === 0) {
            return;
        }

        if (!this.isStarted) {
            this.isStarted = true;
            this.startDistance = distance;
            this.fire(e, {
                distance: distance,
                scale: 1
            }, 'start');
        } else {
            this.fire(e, {
                distance: distance,
                scale: distance / this.startDistance
            });
        }
    },
    end: function (e) {
        if (!this.isStarted || e.changedTouches.length !== this.touchCount) {
            return;
        }

        var distance = this.getDistance(e.changedTouches);

        this.fire(e, {
            distance: distance,
            scale: distance / this.startDistance
        }, 'end');

        this.isStarted = false;
    }
});
