const crypto = require("crypto");
const fs = require("fs");

// const privateKeyLocation = 'node/wallet/private_key';

const PROVISION = 2;

var privateKey, publicKey;

generatePrivateKey = (callback) => {
    crypto.generateKeyPair('ec', {
        namedCurve: 'sect239k1',
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    }, (err, publicKeyTmp, privateKeyTmp) => {
        privateKey = privateKeyTmp;
        publicKey = publicKeyTmp;
        // console.log("Public key: " + stringToHex(publicKey));
        callback (null,[stringToHex(privateKey),stringToHex(publicKey)]);
    });
}

initWallet = () => {
}

getBalance = (address, unspentTxOuts) => {
    var coinsArray = unspentTxOuts.filter(uTxO => uTxO.address === address).map(uTxO => uTxO.amount);
    var sum = coinsArray.reduce((a, b) => a + b, 0);
    return sum;
}

findTxOutsForAmount = (amount, myUnspentTxOuts) => {
    let currentAmount = 0;
    const includedUnspentTxOuts = [];
    for (const myUnspentTxOut of myUnspentTxOuts) {
        includedUnspentTxOuts.push(myUnspentTxOut);
        currentAmount = currentAmount + myUnspentTxOut.amount;
        if (currentAmount >= amount) {
            const leftOverAmount = currentAmount - amount - PROVISION;
            return { includedUnspentTxOuts, leftOverAmount }
        }
    }
    return Error('Not enough coins to send transaction. Required: ' + amount);
}

function stringToHex(str) {
    //we save the actual key (without the header and footer)
    var endStr;
    if (str.includes("PUBLIC")){
        endStr = str.substr(27,113);
    }
    else{
        endStr = str.substr(28,174);
    }
    //converting string into buffer
    let bufStr = Buffer.from(endStr, 'utf8');
    //with buffer, you can convert it into hex with following code
    return bufStr.toString('hex');
}

module.exports = { getBalance, initWallet, generatePrivateKey, PROVISION: PROVISION }