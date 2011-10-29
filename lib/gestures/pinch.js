CreateRecognizer('pinchstart', {});
CreateRecognizer('pinchend', {});

CreateRecognizer('pinch', {
    getDistance: function (touch1, touch2) {
        return Math.sqrt(Math.pow((touch2.pageX - touch1.pageX), 2) + Math.pow((touch2.pageY - touch1.pageY), 2));
    },
    touchstart: function (e) {
        this.shouldFire = true;
        this.isStarted = false;
    },
    touchmove: function (e) {
        if (e.touches.length !== 2) {
            return;
        }

        var touches = e.touches,
            touch1 = touches[0],
            touch2 = touches[1],
            distance = this.getDistance(touch1, touch2);

        if (distance === 0) {
            return;
        }

        distance = (isNaN(distance)) ? 0 : distance;

        if (!this.isStarted) {
            this.isStarted = true;
            this.startDistance = distance;

            this.fire(e, {
                distance: distance,
                scale: 1
            }, 'pinchstart');
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

        var touches = e.changedTouches,
            touch1 = touches[0],
            touch2 = touches[1],
            distance = this.getDistance(touch1, touch2);

        this.fire(e, {
            distance: distance,
            scale: distance / this.startDistance
        }, 'pinchend');

        this.isStarted = false;
    }
});
