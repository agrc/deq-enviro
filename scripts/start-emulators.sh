#!/bin/bash

# this is in a script file because escaping this stuff in package.json is a pain
firebase emulators:start --import .emulator-data --only functions,storage,firestore "$@" 2> >(grep -Ev 'lsof|Output information may be incomplete|assuming "dev=.*" from mount table' >&2)
