#!/bin/bash

mkdir -p dist/

OUT="dist/jsgestures.js"
OUT_MIN="dist/jsgestures.min.js"
RECOGNIZERS=lib/gestures/*
DIR=$(dirname $0)
VERSION=$(node $DIR/getversion.js)

# TODO: need URLs
echo "/*! JSGestureRecognizer v$VERSION http://paularmstrong.github.com/JSGestureRecognizer | http://paularmstrong.github.com/JSGestureRecognizer/license.html */" > $OUT
echo "(function () {" >> $OUT
cat lib/gestures.js >> $OUT
for f in $RECOGNIZERS
do
    cat $f >> $OUT
done
echo "}());" >> $OUT

node_modules/uglify-js/bin/uglifyjs $OUT > $OUT_MIN

echo "Successfully packaged v$VERSION to dist/jsgestures.js"
echo ""