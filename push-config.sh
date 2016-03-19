#!/bin/bash

set -e
set -o pipefail

if [ ! "$#" -eq 1 ]
then
	echo >&2 "Usage: $0 <instance-config.json>"
	exit 1
fi

CFG="$1"

URL="$(jq -r .design_document < $CFG)"


REV="$(curl -sk $URL | jq ._rev)"

if [ ! "$REV" == "null" ]
then
	REV_OBJ="{\"_rev\":$REV}"
else
	REV_OBJ="{}"
fi


jq -M -c -s \
	".[0] + {\"instance_config\":.[1].instance_config} + $REV_OBJ" \
	sharebill.json "$CFG" \
	| curl -k -d @- -X PUT "$URL"
