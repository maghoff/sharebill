#!/bin/bash

if [ ! "$#" -eq 1 ]
then
	echo >&2 "Usage: $0 <instance-config.json>"
	exit 1
fi

if [ ! -f "$1" ]
then
	echo >&2 "$1 is not a regular file"
	exit 1
fi

jq -M -c -s '.[0] + {"instance_config":.[1]}' sharebill.json "$1"

exit $?
