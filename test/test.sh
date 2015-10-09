#!/bin/bash

cd "$(dirname "$0")"

cp input/package.json package.json
cp input/bower.json bower.json
cp input/pubspec.yaml pubspec.yaml
cp input/project.yaml project.yaml

../projectyaml.js --indent 4

if [ -z "$(diff package.json expected/package.json)" ] &&
   [ -z "$(diff bower.json expected/bower.json)" ]; then
    rm package.json bower.json pubspec.yaml project.yaml
else
    rm package.json bower.json pubspec.yaml project.yaml
    exit 1
fi
