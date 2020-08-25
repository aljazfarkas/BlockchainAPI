var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');

/*
 * GET
 */
router.get('/', userController.list);
router.get('/login', userController.showLogin);
router.get('/register', userController.showRegister);
router.get('/profile', userController.profile);
router.get('/logout', userController.logout);
router.get('/:id', userController.show);

router.get('/getBalance/:username',userController.getBalance);
router.get('/myTransactions/:username',userController.getMyTransactions)

/*
 * POST
 */
router.post('/', userController.create);
router.post('/savesResponse',userController.savesResponseFb);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

router.post('/createTransaction', userController.createTransaction)

/*
 * PUT
 */

/*
 * DELETE
 */
router.delete('/:id', userController.remove);

module.exports = router;
