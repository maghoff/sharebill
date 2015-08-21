#!/bin/bash

IN="$1"

BASE_NAME="$(echo "$IN" | sed -e 's/^[^\/]*\/\(.*\)\..*$/\1/')"
EXTENSION="$(echo "$IN" | sed -e 's/.*\.\(.*\)$/\1/')"

OUT_SUM=".intermediate/$BASE_NAME.$EXTENSION.sum"

SUM=$(md5sum "$IN" | cut '-d ' -f 1 )
OUT_FILE="release/$BASE_NAME.sum-$SUM.$EXTENSION"

mkdir -p $(dirname "$OUT_SUM") $(dirname "$OUT_FILE")

echo "$SUM" > "$OUT_SUM"
rm -f "release/$BASE_NAME.sum-*.$EXTENSION"
cp "$IN" "$OUT_FILE"
