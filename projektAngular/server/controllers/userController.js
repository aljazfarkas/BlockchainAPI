const userModel = require('../models/userModel.js');
const http = require('http');
const request = require('request');

// var PORT = 3001;
const PORT = process.argv[2];

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {

  /**
   * userController.list()
   */
  list: function (req, res) {
    userModel.find(function (err, users) {
      if (err) {
        return res.status(500).json({
          message: 'Error when getting user.',
          error: err
        });
      }
      return res.json(users);
    });
  },

  /**
   * userController.show()
   */
  show: function (req, res) {
    var id = req.params.id;
    userModel.findOne({ _id: id }, function (err, user) {
      if (err) {
        return res.status(500).json({
          message: 'Error when getting user.',
          error: err
        });
      }
      if (!user) {
        return res.status(404).json({
          message: 'No such user'
        });
      }
      return res.json(user);
    });
  },

  /**
   * userController.create()
   */
  create: function (req, res) {
    callback = function (response) {
      var json = '';
      response.on('data', function (chunk) {
        json += chunk;
      });
      response.on('end', function () {
        const jsonObj = JSON.parse(json);
        privateKey = jsonObj.privateKey;
        publicKey = jsonObj.publicKey;
        var user = new userModel({
          privateKey: privateKey,
          publicKey: publicKey,
          username: req.body.username,
          password: req.body.password
        });
        user.save(function (err, user) {
          if (err) {
            return res.status(500).json({
              message: 'Error when creating user',
              error: err
            });
          }
          return res.status(201).json(user);
        });
      })
    }
    //we get privateKey we are going to use on this account
    //CHANGE PORT LATER TO REQ.BODY.PORT
    http.get('http://localhost:' + PORT + '/newAddress', callback).end();
  },
  /**
  * userController.savesResponseFb()
  */
  savesResponseFb: function (req, res) {
    callback = function (response) {
      var json = '';
      response.on('data', function (chunk) {
        json += chunk;
      });
      response.on('end', function () {
        const jsonObj = JSON.parse(json);
        privateKey = jsonObj.privateKey;
        publicKey = jsonObj.publicKey;
        userModel.exists({ username: req.body.email }, function (err, bool) {
          if (err) {
            return res.status(500);
          }
          if (bool == false){
            var user = new userModel({
              password: "facebook",
              privateKey: privateKey,
              publicKey: publicKey,
              provider: req.body.provider,
              id: req.body.id,
              username: req.body.email,
              name: req.body.name,
              photoUrl: req.body.photoUrl,
              firstName: req.body.firstName,
              lastName: req.body.lastName,
              idToken: req.body.idToken,
              authorizationCode: req.body.authorizationCode,
            });
            user.save(function (err, user) {
              if (err) {
                return res.status(500).json({
                  message: 'Error when creating user',
                  error: err
                });
              }
              return res.status(201).json(user);
            });
          }
          else{
            userModel.findOne({ username: req.body.email },function(err,user){
              if (err) {
                return res.status(500);
              }
              return res.status(202).json(user);
            })
          }
        })
      })
    }
    //we get privateKey we are going to use on this account
    //CHANGE PORT LATER TO REQ.BODY.PORT
    http.get('http://localhost:' + PORT + '/newAddress', callback).end();
  },
  /**
   * userController.getBalance()
   */
  getBalance: function (req, res) {
    const username = req.params.username;
    var balance = 0;
    var publicKey;
    callback = function (error, response, body) {
      balance = body.balance;
      res.json({ "balance": balance, "publicKey": publicKey });
    }
    userModel.findOne({ username: username }, function (err, user) {
      if (err) {
        return res.status(500).json({
          message: 'Error when getting user.',
          error: err
        });
      }
      if (!user) {
        return res.status(404).json({
          message: 'No such user'
        });
      }
      publicKey = user.publicKey;
      request.post('http://localhost:' + PORT + '/getBalance', { json: { "address": publicKey } }, callback);
    });
  },
  /**
   * userController.login()
   */
  showLogin: function (req, res) {
    res.render('user/login');
  }
  ,
  showRegister: function (req, res) {
    res.render('user/register');
  }
  ,
  login: function (req, res, next) {
    userModel.authenticate(req.body.username, req.body.password, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong username or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.status(201).json(user);
      }
    })
  },
  /**
   * userController.login()
   */

  logout: function (req, res, next) {
    if (req.session) {
      // delete session object
      req.session.destroy(function (err) {
        if (err) {
          return next(err);
        } else {
          return res.status(200);
        }
      });
    }
  },
  /**
   * userController.createTransaction()
   */
  createTransaction: function (req, res) {
    const address = req.body.address;
    const amount = req.body.amount;
    const username = req.body.username;
    callback = function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body);
        res.json({ "body": body });
      }
      else {
        console.log(JSON.stringify(response, null, 2));
        res.json({ "body": "Error" });
      }
    }
    userModel.findOne({ username: username }, function (err, user) {
      if (err) {
        return res.status(500).json({
          message: 'Error when getting user.',
          error: err
        });
      }
      if (!user) {
        return res.status(404).json({
          message: 'No such user'
        });
      }
      request.post('http://localhost:' + PORT + '/generateTransaction', { json: { "privateKey": user.privateKey, "publicKey": user.publicKey, "address": address, "amount": amount } }, callback);
    });
  },
  /**
 * userController.getMyTransactions()
 */
  getMyTransactions: function (req, res) {
    const username = req.params.username;
    callback = function (response) {
      var json = '';
      response.on('data', function (chunk) {
        json += chunk;
      });
      response.on('end', function () {
        return res.status(200).json(JSON.parse(json));
      });
    }
    userModel.findOne({ username: username }, function (err, user) {
      if (err) {
        return res.status(500).json({
          message: 'Error when getting user.',
          error: err
        });
      }
      if (!user) {
        return res.status(404).json({
          message: 'No such user'
        });
      }
      http.get('http://localhost:' + PORT + '/myTransactions/' + user.publicKey, callback).end();
    });
  },
  /**
  * userController.profil()
  */

  profile: function (req, res, next) {
    userModel.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          if (user === null) {
            var err = new Error('Not authorized! Go back!');
            err.status = 400;
            return next(err);
          } else {
            res.render('user/profile', user);
          }
        }
      });
  },
  /**
   * userController.remove()
   */
  remove: function (req, res) {
    var id = req.params.id;
    userModel.findByIdAndRemove(id, function (err, user) {
      if (err) {
        return res.status(500).json({
          message: 'Error when deleting the user.',
          error: err
        });
      }
      return res.status(204).json();
    });
  }
};
