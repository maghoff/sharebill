#!/bin/bash

OUT="$1"
shift

echo "{" > "$OUT"

while [ $# -gt 0 ] ;
do
	echo -n "    \"$(basename "$1" | sed -e 's/\./_/g')\": \"$(cat "$1")\"" >> "$OUT"
	shift
	if [ $# -gt 0 ] ; then echo -n "," >> "$OUT" ; fi
	echo "" >> "$OUT"
done

echo "}" >> "$OUT"
