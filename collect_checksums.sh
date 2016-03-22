#!/bin/bash

echo "{"

if [ -f cdn_base ] ;
then
	echo -n "    \"cdn_base\": \"$(cat cdn_base)\""
	if [ $# -gt 0 ] ; then echo -n "," ; fi
	echo ""
fi

while [ $# -gt 0 ] ;
do
	echo -n "    \"$(basename "$1" | sed -e 's/\./_/g')\": \"$(cat "$1")\""
	shift
	if [ $# -gt 0 ] ; then echo -n "," ; fi
	echo ""
done

echo "}"
