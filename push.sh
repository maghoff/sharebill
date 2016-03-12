#!/bin/bash

if [ ! "$#" -eq 1 ]
then
	echo >&2 "Usage: ./configure-instance.sh <instance-config.json> | $0 <design document URL>"
	exit 1
fi

URL="$1"

REV="$(curl -k "$URL" 2>/dev/null | jq ._rev)"

if [ ! "$REV" == "null" ]
then
	REV_OBJ="{\"_rev\":$REV}"
else
	REV_OBJ="{}"
fi

jq -M -c -s ".[0] + $REV_OBJ" | curl -k -d @- -X PUT "$URL"
