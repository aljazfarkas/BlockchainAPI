var crypto = require('crypto');

class Block{
    constructor(index, data, previousHash){
        this.index = index;
        this.data = data;
        this.timestamp = Date.now();
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = 0;
    }
    //calculates the hash value of a block
    hashValue(){
        const {index, data, timestamp, previousHash, nonce} = this;
        const blockString = `${index}-${data}-${timestamp}-${previousHash}-${nonce}`;
        const hashFunction = crypto.createHash('sha256');
        hashFunction.update(blockString);
        return hashFunction.digest('hex');
    }
}

module.exports = Block;
