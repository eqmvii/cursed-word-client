#!/bin/bash

echo "uh oh!"

rm -rf awsbundle/

echo -e "zoom zoom\n"

mkdir awsbundle

cp package.json awsbundle/package.json
cp yarn.lock awsbundle/yarn.lock
cp cursed-word-oracle.js awsbundle/cursed-word-oracle.js
cp account.json awsbundle/account.json
cp sorted-word-list.json awsbundle/sorted-word-list.json
cp secret.json awsbundle/secret.json

cp -R contracts/ awsbundle/contracts

echo "slam!"
