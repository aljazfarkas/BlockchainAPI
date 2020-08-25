var express = require('express');
var router = express.Router();
var nodeController = require('../controllers/nodeController.js');

/* GET */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Projektna naloga Spletno programiranje' });
});

router.get('/addNode/:port', nodeController.addNode)
router.get('/newBlock/:publicKey', nodeController.newBlock)
router.get('/getLatestBlock', nodeController.getLatestBlock)
router.get('/getChain', nodeController.getChain)
router.get('/getPeerNumber', nodeController.getPeerNumber)
router.get('/getPeers', nodeController.getPeers)
router.get('/newAddress',nodeController.newAddress)

router.get('/myTransactions/:publicKey',nodeController.showMyTransactions)

/* POST */
router.post('/getBalance',nodeController.getBalance)
router.post('/generateTransaction', nodeController.generateTransaction)

module.exports = router;
