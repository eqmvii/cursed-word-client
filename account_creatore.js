// Account Creatore
// The extra E makes it Italian

const Web3 = require('web3');

const web3 = new Web3('ws://127.0.0.1:8545');

const newAccount = web3.eth.accounts.create(process.argv[2] || 'pu23rple m234onkey dishw234asher zzzzz lkjafdo87243 ra942ndom');

console.log(`\nAddress: ${newAccount.address}\nPK: ${newAccount.privateKey}\n`)

process.exit();
