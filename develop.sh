#!/bin/bash

trap teardown INT

teardown() {
	screen -X -S couchapp quit
	screen -X -S jstestdriver quit
	exit 0
}

screen -dmS couchapp couchapp autopush
screen -dmS jstestdriver jstestdriver --port 4224

google-chrome http://localhost:4224/ &

./jsTestDriver-tests/autojstestdriver

teardown
