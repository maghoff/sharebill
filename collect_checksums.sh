#!/bin/bash

OUT="$1"
shift

echo "{" > "$OUT"

if [ -f cdn_base ] ;
then
	echo -n "    \"cdn_base\": \"$(cat cdn_base)\"" >> "$OUT"
	if [ $# -gt 0 ] ; then echo -n "," >> "$OUT" ; fi
	echo "" >> "$OUT"
fi

while [ $# -gt 0 ] ;
do
	echo -n "    \"$(basename "$1" | sed -e 's/\./_/g')\": \"$(cat "$1")\"" >> "$OUT"
	shift
	if [ $# -gt 0 ] ; then echo -n "," >> "$OUT" ; fi
	echo "" >> "$OUT"
done

echo "}" >> "$OUT"
