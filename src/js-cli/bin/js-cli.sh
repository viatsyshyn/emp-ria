#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
CD="${PWD##*/}"
CP="$DIR/js.jar:$DIR/hash-utils.jar"

java -cp $CP org.mozilla.javascript.tools.shell.Main $DIR/../js-cli.js $DIR/../ $CD $@