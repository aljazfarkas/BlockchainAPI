const WebSocket = require('ws');
const Chain = require('./chainModel.js');
const fs = require('fs');
const transactions = require('../models/transactionModel')
const wallet = require('../models/walletModel')

const REQUEST_CHAIN = "REQUEST_CHAIN";
const REQUEST_BLOCK = "REQUEST_BLOCK";
const BLOCK = "BLOCK";
const CHAIN = "CHAIN";
const TRANSACTION = "TRANSACTION";

let unspentTxOuts = [];
let blockData = [];

class Node {
    constructor(port) {
        this.sockets = [];
        this.server = null;
        this.port = port;
        this.chain = new Chain();
        this.peers = [];
    }
    init() {
        this.chain.init();

        this.server = new WebSocket.Server({ port: this.port });

        this.server.on('connection', (connection) => {
            this.initConnection(connection);

        });
        //we use addNodeFromFile to add every node in peers.json
        try {
            this.peers = JSON.parse(fs.readFileSync("./peers.json"));
            console.log("Reading from peers.json...")
            this.peers.forEach(peer => {
                //we don't add ourselves, so we split the peer string at ':' sign
                //res[2] is the port area
                var tmp = peer.toString();
                var res = tmp.split(":");
                if (res[2] != this.port) {
                    this.addPeerFromFile(peer);
                }
            });
            console.log("Finished reading, " + this.peers.length + " peers added.");
        } catch (err) {
            console.log("Error when reading from peers.json file");
        }
    }
    messageHandler(connection) {
        connection.on('message', (data) => {
            const msg = JSON.parse(data);
            switch (msg.event) {
                case REQUEST_CHAIN:
                    connection.send(JSON.stringify({ event: CHAIN, message: this.chain.getChain() }))
                    break;
                case REQUEST_BLOCK:
                    this.requestLatestBlock(connection);
                    break;
                case BLOCK:
                    this.processedReceivedBlock(msg.message);
                    // console.log(msg.message);
                    break;
                case CHAIN:
                    this.processedReceivedChain(msg.message);
                    break;
                case TRANSACTION:
                    this.processedReceivedTransaction(msg.message);
                    break;
                default:
                    console.log('Unknown message ');
            }
        });
    }

    initConnection(connection) {
        this.messageHandler(connection);

        this.requestLatestBlock(connection);

        this.sockets.push(connection);

        connection.on('error', () => this.closeConnection(connection));
        connection.on('close', () => this.closeConnection(connection));
    }


    requestLatestBlock(connection) {
        connection.send(JSON.stringify({ event: BLOCK, message: this.chain.getLatestBlock() }))
    }


    processedReceivedChain(blocks) {
        let newChain = blocks.sort((block1, block2) => (block1.index - block2.index))
        if (newChain.length > this.chain.getTotalBlocks()) {//&& this.chain.checkNewChainIsValid(newChain)
            //UPDATAMO UNSPENTTXOUTS
            newChain.map(block => {
                if (block.index != 0)
                    return unspentTxOuts = transactions.processTransactions(block.data, unspentTxOuts, block.index);
            });
            if (unspentTxOuts != null) {
                this.chain.replaceChain(newChain);
            }
        }
    }


    processedReceivedBlock(block) {
        let currentTopBlock = this.chain.getLatestBlock();

        // Is the same or older?
        if (block.index <= currentTopBlock.index) {
            console.log('No update needed');
            return;
        }

        //Is claiming to be the next in the chain
        if (block.previousHash == currentTopBlock.hash) {
            // IMPLEMENTIRAT RABIM SINHRONIZACIJO
            //primerjam samo id-je za sinhronizacijo
            var blockDataTmp = blockData.filter(tx => {
                block.data.forEach(element => {
                    if (tx.id === element.id) {
                        return true;
                    }
                });
                return false;
            })
            blockData = blockDataTmp;
            //UPDATAMO UNSPENTTXOUTS
            unspentTxOuts = transactions.processTransactions(block.data, unspentTxOuts, block.index);
            if (unspentTxOuts != null) {
                //Attempt the top block to our chain
                this.chain.addToChain(block);
                console.log('New block added');
            }

        } else {
            // It is ahead.. we are therefore a few behind, request the whole chain
            console.log('Requesting chain');
            this.broadcastMessage(REQUEST_CHAIN, "");
        }
    }
    broadcastMessage(event, message) {
        this.sockets.forEach(node => {
            return node.send(JSON.stringify({ event, message }));
        });
    }
    closeConnection(connection) {
        console.log('Closing connection');
        this.sockets.splice(this.sockets.indexOf(connection), 1);
    }
    createBlock(publicKey) {
        const transactionsNm = blockData.length;
        const coinbaseTx = transactions.getCoinbaseTransaction(publicKey, this.chain.getLatestBlock().index + 1, transactionsNm);
        blockData.unshift(coinbaseTx);

        const retVal = transactions.processTransactions(blockData, unspentTxOuts, this.chain.getLatestBlock().index + 1);

        if (retVal == null) {
            blockData = [];
            return false;
        }

        unspentTxOuts = retVal;

        
        let newBlock = this.chain.createBlock(blockData);
        this.chain.addToChain(newBlock);

        this.broadcastMessage(BLOCK, newBlock);
        blockData = [];
        return newBlock;
    }
    processedReceivedTransaction(transaction) {
        blockData.push(transaction);
        console.log("Transaction received.")
    }

    generateTransaction(receiverAddress, amount, privateKey, publicKey) {
        //todo: validate
        const tx = createTransaction(receiverAddress, amount, privateKey,publicKey, unspentTxOuts);
        blockData.push(tx);
        this.broadcastMessage(TRANSACTION, tx);
        return tx;
    }

    getBalance(address) {
        return wallet.getBalance(address, unspentTxOuts);
    }

    getLatestBlock() {
        return this.chain.getLatestBlock();
    }

    getChain() {
        return this.chain.getChain();
    }

    getPeerNumber() {
        return { "peers": this.peers.length };
    }

    getPeers() {
        var peersAll = "{";
        this.peers.forEach(function (value, i) {
            peersAll = peersAll + "peer" + i + " : " + value;
        })
        peersAll = peersAll + "}";
        return peersAll;
    }

    addPeer(host, port) {
        let connection = new WebSocket(`ws://${host}:${port}`);
        //shrani se v array peer-ov
        this.peers.push(`ws://${host}:${port}`);
        //array shranimo v datoteko peers.json
        fs.writeFile(
            './peers.json',
            JSON.stringify(this.peers),
            function (err) {
                if (err) {
                    console.error('Error writting to peers.json');
                }
            }
        );

        console.log("Peers: " + this.peers.toString());
        connection.on('error', (error) => {
            console.log(error);
        });

        connection.on('open', (msg) => {
            this.initConnection(connection);
        });
    }
    addPeerFromFile(hostJson) {
        let connection = new WebSocket(hostJson);
        connection.on('error', (error) => {
            // console.log("Host " + hostJson + " not reachable.");
        });
        connection.on('open', (msg) => {
            this.sockets.push(connection);
            this.messageHandler(connection);
            // this.initConnection(connection);
        });
    }
}

module.exports = Node;