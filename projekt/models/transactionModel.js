const crypto = require('crypto');
const wallet = require('./walletModel');
const _ = require('underscore');
const collections = require('collections');

const COINBASE_AMOUNT = 50;
const PROVISION = wallet.PROVISION;

class TxOut {
    constructor(address, amount) {
        this.address = address;
        this.amount = amount;
    }
}

class TxIn {
    constructor() {
        this.txOutId = "";
        this.txOutIndex = 0;
        this.signature = "";
    }
}

class Transaction {
    constructor() {
        this.id = 0;
        this.txIns = [];
        this.txOuts = [];
    }
}

class UnspentTxOut {
    constructor(txOutId, txOutIndex, address, amount) {
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.address = address;
        this.amount = amount;
    }
}

getCoinbaseTransaction = (address, blockIndex, transactionsNm) => {
    const t = new Transaction();
    const txIn = new TxIn();
    txIn.signature = "";
    txIn.txOutId = "";
    txIn.txOutIndex = blockIndex;

    t.txIns = [txIn];
    t.txOuts = [new TxOut(address, COINBASE_AMOUNT + 2 * transactionsNm)];
    t.id = getTransactionId(t);
    return t;
}

getTransactionId = (transaction) => {
    const txInContent = transaction.txIns.map(txIn => txIn.txOutId + txIn.txOutIndex).reduce((a, b) => a + b, '');
    const txOutContent = transaction.txOuts.map(txOut => txOut.address + txOut.amount).reduce((a, b) => a + b, '');

    return crypto.createHash("sha256").update(txInContent + txOutContent).digest("hex");
}
validateTransaction = (transaction, aUnspentTxOuts) => {
    if (getTransactionId(transaction) != transaction.id) {
        console.log("Invalid txId: " + transaction.id);
    }
    const hasValidTxIns = transaction.txIns
        .map(txIn => validateTxIn(txIn, transaction, aUnspentTxOuts))
        .reduce((a, b) => a && b, true);
    if (!hasValidTxIns) {
        console.log("Some of the txIns are invalid in tx: " + transaction.id);
        return false;
    }
    const totalTxInValues = transaction.txIns
        .map(txIn => getTxInAmount(txIn, aUnspentTxOuts))
        .reduce((a, b) => (a + b), 0);
    const totalTxOutValues = transaction.txOuts
        .map(txOut => txOut.amount)
        .reduce((a, b) => (a + b), 0);

    //we check if there is same number of transaction inputs and outputs
    //WE ADD PROVISION SO IT IS EVENED OUT
    if (totalTxInValues !== totalTxOutValues + wallet.PROVISION) {
        console.log("totalTxOutValues !== totalTxInValues in tx: " + transaction.id);
        return false;
    }
    return true;
}

validateBlockTransactions = (aTransactions, aUnspentTxOuts, blockIndex) => {
    const coinbaseTx = aTransactions[0];
    const transactionsNm = aTransactions.length;
    if (!validateCoinbaseTx(coinbaseTx, blockIndex, transactionsNm)) {
        console.log("Invalid coinbase transaction: " + JSON.stringify(coinbaseTx));
        return false;
    }
    //check for duplicate txIns. Each txIn can be included only once
    const txIns = _(aTransactions).map(tx => tx.txIns).flatten().value;
    if (hasDuplicates(txIns)) {
        return false;
    }
    // all but coinbase transactions
    const normalTransactions = aTransactions.slice(1);
    return normalTransactions.map((tx) => validateTransaction(tx, aUnspentTxOuts))
        .reduce((a, b) => (a && b), true);

}

hasDuplicates = (txIns) => {
    const groups = _.countBy(txIns, (txIn) => txIn.txOutId + txIn.txOutIndex);
    return _(groups)
        .map((value, key) => {
            if (value > 1) {
                console.log('duplicate txIn: ' + key);
                return true;
            } else {
                return false;
            }
        })
        .includes(true);
}

validateCoinbaseTx = (transaction, blockIndex, transactionsNm) => {
    if (transaction == null) {
        console.log('The first transaction in the block must be coinbase transaction');
        return false;
    }
    if (getTransactionId(transaction) !== transaction.id) {
        console.log('Invalid coinbase tx id: ' + transaction.id);
        return false;
    }
    if (transaction.txIns.length !== 1) {
        console.log('One txIn must be specified in the coinbase transaction');
        return;
    }
    if (transaction.txIns[0].txOutIndex !== blockIndex) {
        console.log('The txIn signature in coinbase tx must be the block height. blockIndex: ' + blockIndex);
        return false;
    }
    if (transaction.txOuts.length !== 1) {
        console.log('Invalid number of txOuts in coinbase transaction');
        return false;
    }
    if (transaction.txOuts[0].amount !== COINBASE_AMOUNT + transactionsNm * wallet.PROVISION - wallet.PROVISION) {
        console.log('Invalid coinbase amount in original coinbase transaction. Amount: ' + transaction.txOuts[0].amount + "\nNeeded to be: " + (COINBASE_AMOUNT + transactionsNm * wallet.PROVISION));
        return false;
    }
    return true;
}

getTxInAmount = (txIn, aUnspentTxOuts) => {
    return findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts).amount;
}

validateTxIn = (txIn, transaction, aUnspentTxOuts) => {
    const referencedTxOut = aUnspentTxOuts.find(uTxO => uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex);
    if (referencedTxOut == null) {
        console.log("Referenced txOut not found: " + JSON.stringify(txIn));
        return false;
    }
    const address = referencedTxOut.address;

    const verify = crypto.createVerify('SHA256');
    verify.update(transaction.id);
    //we need to convert signature from hex to string, so we get pem format
    var addressString = Buffer.from(address, "hex").toString("utf8");
    //we add header and footer
    addressString = "-----BEGIN PUBLIC KEY-----\n" + addressString + "\n-----END PUBLIC KEY-----";

    const validSignature = verify.verify(addressString, txIn.signature, 'hex');
    if (!validSignature) {
        console.log("Invalid txIn signature: " + txIn.signature);
        return false;
    }
    return true;

}
signTxIn = (transaction, privateKey) => {
    // const txIn = transaction.txIns[txInIndex];

    const dataToSign = transaction.id;
    // const referencedUnspentTxOut = findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts);
    // const referencedAddress = referencedUnspentTxOut.address;
    const privateKeyFull = "-----BEGIN PRIVATE KEY-----\n" + Buffer.from(privateKey, "hex").toString("utf8") + "\n-----END PRIVATE KEY-----";

    var sign = crypto.createSign('SHA256');
    sign.update(dataToSign);
    const signature = sign.sign(privateKeyFull, 'hex');

    return signature;
}

isValidTransactionsStructure = (transactions) => {
    return transactions
        .map(isValidTransactionStructure)
        .reduce((a, b) => (a && b), true);
};
isValidTxInStructure = (txIn) => {
    if (txIn == null) {
        console.log('txIn is null');
        return false;
    } else if (typeof txIn.signature !== 'string') {
        console.log('invalid signature type in txIn');
        return false;
    } else if (typeof txIn.txOutId !== 'string') {
        console.log('invalid txOutId type in txIn');
        return false;
    } else if (typeof txIn.txOutIndex !== 'number') {
        console.log('invalid txOutIndex type in txIn');
        return false;
    } else {
        return true;
    }
};
isValidTransactionStructure = (transaction) => {
    if (typeof transaction.id !== 'string') {
        console.log('transactionId missing');
        return false;
    }
    if (!(transaction.txIns instanceof Array)) {
        console.log('invalid txIns type in transaction');
        return false;
    }
    if (!transaction.txIns
        .map(isValidTxInStructure)
        .reduce((a, b) => (a && b), true)) {
        return false;
    }

    if (!(transaction.txOuts instanceof Array)) {
        console.log('invalid txIns type in transaction');
        return false;
    }

    if (!transaction.txOuts
        .map(isValidTxOutStructure)
        .reduce((a, b) => (a && b), true)) {
        return false;
    }
    return true;
};
isValidTxOutStructure = (txOut) => {
    if (txOut == null) {
        console.log('txOut is null');
        return false;
    } else if (typeof txOut.address !== 'string') {
        console.log('invalid address type in txOut');
        return false;
    } else if (!isValidAddress(txOut.address)) {
        console.log('invalid TxOut address');
        return false;
    } else if (typeof txOut.amount !== 'number') {
        console.log('invalid amount type in txOut');
        return false;
    } else {
        return true;
    }
}


// valid address is a valid ecdsa public key in the 04 + X-coordinate + Y-coordinate format
isValidAddress = (address) => {
    if (address.length !== 226 && address.length !== 348) {
        console.log('invalid public key length. Length: ' + address.length);
        return false;
    } else if (address.match('^[a-fA-F0-9]+$') === null) {
        console.log('public key must contain only hex characters');
        return false;
    } else if (!address.startsWith('4d')) {
        console.log('public key must start with 4d');
        return false;
    }
    return true;
}

updateUnspentTxOuts = (newTransactions, aUnspentTxOuts) => {
    const newUnspentTxOuts = newTransactions.map(t => { return t.txOuts.map((txOut, index) => new UnspentTxOut(t.id, index, txOut.address, txOut.amount)) })
        .reduce((a, b) => a.concat(b), []);
    const consumedTxOuts = newTransactions
        .map(t => t.txIns)
        .reduce((a, b) => a.concat(b), [])
        .map(txIn => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, '', 0));
    const resultingUnspentTxOuts = aUnspentTxOuts.filter((uTxO => !findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts)))
        .concat(newUnspentTxOuts);

    return resultingUnspentTxOuts;
}

createTxOuts = (receiverAddress, myAddress, amount, leftOverAmount) => {
    const txOut1 = new TxOut(receiverAddress, amount);
    if (leftOverAmount === 0) {
        return [txOut1];
    }
    else {
        const leftOverTx = new TxOut(myAddress, leftOverAmount);
        return [txOut1, leftOverTx];
    }
}

findUnspentTxOut = (transactionId, index, aUnspentTxOuts) => {
    return aUnspentTxOuts.find((uTxO) => uTxO.txOutId === transactionId && uTxO.txOutIndex === index);
}

processTransactions = (aTransactions, aUnspentTxOuts, blockIndex) => {
    //ADD CODE https://github.com/lhartikk/naivecoin/blob/chapter3/src/transaction.ts
    if (!isValidTransactionsStructure(aTransactions)) {
        console.log("invalid transaction structure");
        return null;
    }
    if (!validateBlockTransactions(aTransactions, aUnspentTxOuts, blockIndex)) {
        console.log('invalid block transactions');
        return null;
    }
    return updateUnspentTxOuts(aTransactions, aUnspentTxOuts);
}
createTransaction = (receiverAddress, amount, privateKey, publicKey, unspentTxOuts) => {
    const myAddress = publicKey;
    const myUnspentTxOuts = unspentTxOuts.filter(uTxO => uTxO.address === myAddress);

    const { includedUnspentTxOuts, leftOverAmount } = findTxOutsForAmount(amount, myUnspentTxOuts);

    const toUnsignedTxIn = (unspentTxOut => {
        const txIn = new TxIn();
        txIn.txOutId = unspentTxOut.txOutId;
        txIn.txOutIndex = unspentTxOut.txOutIndex;
        return txIn;
    })
    var unsignedTxIns;
    if (typeof(includedUnspentTxOuts) != "undefined"){
        unsignedTxIns = includedUnspentTxOuts.map(toUnsignedTxIn);
    }
    else{
       throw Error("Error when creating Transaction");
    }

    const tx = new Transaction();
    tx.txIns = unsignedTxIns;
    tx.txOuts = createTxOuts(receiverAddress, myAddress, amount, leftOverAmount);
    tx.id = getTransactionId(tx);

    tx.txIns = tx.txIns.map((txIn, index) => {
        txIn.signature = signTxIn(tx, privateKey);
        return txIn;
    })

    return tx;
}

module.exports = { processTransactions, signTxIn, getBalance, getTransactionId, TxIn, TxOut, getCoinbaseTransaction, Transaction, createTransaction, createTxOuts, updateUnspentTxOuts }