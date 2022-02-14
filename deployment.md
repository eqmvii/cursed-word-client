# scaff-eth

`yarn generate` creates a new account

(fund deployment account)

`yarn account` lists balances etc.

`yarn deploy --network rinkeby`

# GH pages deploy

```
git checkout -b "gh-pages"

npm run build

mv dist/ docs/

git add -A

git commit -m "DEPLOY"

git push origin main
```

This pushes to the gh-pages which is configured to serve from docs/ (the only option gh-pages has...)

Clean up by returning to main, and deleting the branch: `git checkout main && git branch -d gh-pages`

So it can be recreated and deployed again.
