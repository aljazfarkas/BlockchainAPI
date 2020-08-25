const Block = require('./blockModel.js');
const transactions = require('./transactionModel.js');
const wallet = require('./walletModel');


class Chain {
    constructor() {
        this.chain = [];
        this.currentBlock = {};
        this.genesisBlock = {};
    }
    init() {
        this.genesisBlock = new Block(0, [], "-1");
        this.genesisBlock.hash = this.genesisBlock.hashValue();
        this.chain.push(this.genesisBlock);
        this.currentBlock = this.genesisBlock;
    }
    getLatestBlock() {
        return this.currentBlock;
    }
    getTotalBlocks() {
        return this.chain.length;
    }
    getChain() {
        return this.chain;
    }
    createBlock(blockData) {
        let newBlock = new Block(this.chain.length, blockData, this.currentBlock.hash);
        newBlock.hash = newBlock.hashValue();
        return newBlock;
    }
    addToChain(block) {
        // if(checkNewBlockIsValid(block, currentBlock)){
            this.chain.push(block);
            this.currentBlock = block;
            return true;
        // }
    }
    replaceChain(newChain) {
        this.chain = newChain;
        this.currentBlock = this.chain[this.chain.length - 1];
    }

}

module.exports = Chain;