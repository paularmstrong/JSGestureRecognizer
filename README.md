JSGestureRecognizer
===================

_Work in Progress. Use at your own risk!_

A minimal monkey-patch library that creates touch-friendly gesture recognizers for DOM event listeners.

Usage
-----

    element.addEventListener('tap', function (e) { console.log("I'm a tap event!"); }, false);

Gesture Events
--------------

* doubletap
* longpress
* pinch
* rotate
* swipe
* tap

You can specify the number of touches required for an event to fire by using `:#` notation:

    element.addEventListener('doubletap:2', function (e) { console.log('double tap with two fingers'); }, false);

Building
--------

If you'd rather pull the repository and build the JavaScript packages yourself, just clone the repo and run the following:

    make && make dist

License
-------

Copyright (c) 2011 Paul Armstrong

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
