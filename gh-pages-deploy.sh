#!/bin/bash

git checkout -b "gh-pages"

npm run build

# gh pages configured to serve from here, lmao dumb hack
mv dist/ docs/

git add -A

git commit -m "DEPLOY"

git push -f origin gh-pages

git checkout -

rm -rf docs/

git branch -D gh-pages

