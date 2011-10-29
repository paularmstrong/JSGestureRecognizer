#!/bin/bash

mkdir -p dist/

OUT="dist/jsgestures.js"
OUT_MIN="dist/jsgestures.min.js"
RECOGNIZERS=lib/gestures/*

echo "(function () {" > $OUT
cat lib/gestures.js >> $OUT
for f in $RECOGNIZERS
do
    cat $f >> $OUT
done
echo "}());" >> $OUT

node_modules/uglify-js/bin/uglifyjs $OUT > $OUT_MIN

echo "Successfully packaged to dist/jsgestures.js"
echo ""