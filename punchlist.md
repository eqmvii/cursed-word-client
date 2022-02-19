# Punchlist

* Consider real deployment and require infrastructure
* Write up instructions and costs
* Handle "Nonce too low errors" -- probably coming from trying to respond + mint in rapid succession
* What happens if you hit 224 words?
* Keyboard styling refactor & cleaning
* Larger dictionary to enforce real word guesses clientside
* Read more about HD wallets and nemonics: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
* Save randomized dictionary to a file
* Do I need vue router and routes? For rules, non-blockchain version, NFT display, etc.?


# nice to have

* Host hardhat / local chain / deploy stuff locally

# DONE

* refactor to remove results received and results, let it all live in guesses as an object
* Refactor guesses responded to so that it's by wordId and guess number?
* aws
* Add columns to include who guessed and maybe guess button
* Turn on guard for eth sent
* clear forEach due to async risk in CursedWord.vue
* Remove game contract eth balance
* Cursed Word Coin send
* Clean up "tokenomics" lmao
* CWC balance
* Deploy to rinkeby testnet
* Refactor pk out of account.json
* Store words in numbered map for crash/reconnect of oracle
* Write new CC SC and integrate with existing SC
* Store CWC contract address in parent
* Refactor oracle to not re-transmit responses if rebooting
* NFT lmao
* Estimate gas before send
* Separate the coin and NFT contracts and make the base upgradeable.
* Recur via setTimeout instead of setInterval to guard against simultaneous correct guesses in oracle

