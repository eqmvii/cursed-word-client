// deploy.js
// Proof of concept for deploying from within this app instead of from scaffold-eth

const Web3 = require('web3');
const CursedWordContract = require('./contracts/CursedWordV2.json');
const account = require('./account.json');

async function deploy() {
  const web3 = new Web3(Web3.givenProvider || "ws://127.0.0.1:8545");
  const freshAccount = web3.eth.accounts.privateKeyToAccount(account.privateKey);
  web3.eth.accounts.wallet.add(freshAccount.privateKey);
  const contractToDeploy = new web3.eth.Contract(CursedWordContract.abi);
  let balance = await web3.eth.getBalance(freshAccount.address);

  console.log(`Begin deploy; balance: ${balance}`);

  let result = await contractToDeploy.deploy({data: CursedWordContract.bytecode }).send({
    from: freshAccount.address,
    // gasPrice (optional - gas price in wei),
    // gas (optional - max gas limit)
    gas: 30_000_000, // TODO make sane idk; that's the block limit
    value: 0, // value to xfer in wei
    // nonce (optional)
  });

  balance = await web3.eth.getBalance(freshAccount.address);
  console.log(`Contract deployed to ${result._address}. End balance: ${balance}`);
}

deploy();
