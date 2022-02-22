// Account Creatore
// The extra E makes it Italian

const Web3Library = require('web3');

const web3Connection = new Web3Library('ws://127.0.0.1:8545');

const newAccount = web3Connection.eth.accounts.create(process.argv[2] || 'pu23rple m234onkey dishw234asher zzzzz lkjafdo87243 ra942ndom');

console.log(`\nAddress: ${newAccount.address}\nPK: ${newAccount.privateKey}\n`)

process.exit();
