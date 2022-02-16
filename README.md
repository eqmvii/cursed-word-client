# DISCLAIMER

I am deeply skeptical of crypto, and the tech underlying crypto. But I want to better understand it, so here is a repo of some experimentation.

# This is a bad idea

Let's ruin a whimsical game by financializing it!

# Seed Money

Send 100 from the first hardhat test account to an arbitrary account
yarn send --from 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 --to [DESTO] --amount 100

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

# Debugging child contracts

Find the json blob for your contract that was compiled, but not added to the hardhat list:

packages\hardhat\artifacts\contracts\CursedWordV4CoinsNFTs.sol\CursedWordTrophy.json

Add it to: packages\react-app\src\contracts\hardhat_contracts.json

manually, in the form of the others, with its address and ABI.

Then you can load it by name with a new Contract component
