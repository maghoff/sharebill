#!/bin/bash

echo "{"

while [ $# -gt 0 ] ;
do
	echo -n "    \"$(basename "$1" | sed -e 's/\./_/g')\": \"$(cat "$1")\""
	shift
	if [ $# -gt 0 ] ; then echo -n "," ; fi
	echo ""
done

echo "}"
