#!/bin/bash

trap teardown INT

teardown() {
	screen -X -S jstestdriver quit
	exit 0
}

screen -dmS jstestdriver jstestdriver --port 4224

sleep 1
google-chrome http://localhost:4224/ &

./jsTestDriver-tests/autojstestdriver

teardown()
