# DISCLAIMER

I am deeply skeptical of crypto, and the tech underlying crypto. But I want to better understand it, so here is a repo of some experimentation.

# This is a bad idea

Let's ruin a whimsical game by financializing it!

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

# Ganache test notes for metamask

In the top right menu of MetaMask, select the network that you are currently connected to. Among several popular defaults, you'll find Custom RPC and Localhost 8545. These are both useful for connecting to a test blockchain, like ganache (opens new window). You can quickly install and start Ganache if you have npm installed with npm i -g ganache-cli && ganache-cli.

Ganache has some great features for starting your application with different states. If your application starts with the -m flag, you can feed it the same seed phrase you have in your MetaMask, and the test network will give each of your first 10 accounts 100 test ether, which makes it easier to start work.
