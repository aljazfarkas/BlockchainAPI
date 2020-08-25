var nodeModel = require('../models/nodeModel.js');
var port;
//randomize port
port = 18070 + Math.floor(Math.random() * 30);
const transactions = require('../models/transactionModel')
const wallet = require('../models/walletModel');
let node = new nodeModel(port);
console.log("Websocket server port: " + port);
node.init();
//initialize wallet
wallet.initWallet();

/**
 * nodeController.js
 *
 * @description :: Server-side logic for managing nodes.
 */
module.exports = {
    addNode: function (req, res) {
        console.log('Add host: ' + req.params.port);

        node.addPeer('localhost', req.params.port);

        res.send();
    },
    newBlock: function (req, res) {
        var publicKey = req.params.publicKey;

        var newBlock = node.createBlock(publicKey);

        res.send(newBlock);
    },
    newAddress: function (req, res) {
        wallet.generatePrivateKey(function (err, pair) {
            res.json({ "privateKey": pair[0], "publicKey": pair[1] });
        })
    },
    getBalance: function (req, res) {
        const address = req.body.address;
        var balance = node.getBalance(address);
        res.json({ "address": address, "balance": balance });
    },
    generateTransaction: function (req, res) {
        const privateKey = req.body.privateKey;
        const publicKey = req.body.publicKey;
        const receiverAddres = req.body.address;
        const amount = parseInt(req.body.amount, 10);

        var tx = node.generateTransaction(receiverAddres, amount, privateKey, publicKey);

        res.send(tx);
    },
    showMyTransactions: function (req, res) {
        const publicKey = req.params.publicKey;
        const chain = node.getChain();
        var myTxs = [];
        chain.map(block => {
            block.data.map(tx => {
                tx.txOuts.map(txOut => {
                    if (txOut.address === publicKey) {
                        myTxs.push(tx);
                    }
                })
            })
        });
        res.send(JSON.stringify(myTxs));
    },
    getLatestBlock: function (req, res) {
        res.send(node.getLatestBlock());
    },
    getChain: function (req, res) {
        res.send(node.getChain());
    },
    getPeerNumber: function (req, res) {
        res.send(node.getPeerNumber());
    },
    getPeers: function (req, res) {
        res.send(node.getPeers());
    }
}