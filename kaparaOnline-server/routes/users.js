var express = require('express');
var router = express.Router();
const User = require('../models/user.model');
var passport = require('passport');
const Order = require('../models/order.model');
const localFunctions = require('../local_functions/local.functions');

// creates new user
router.post('/register', async function (req, res) {
  try {
    /// try to register
    User.register(new User({
      username: req.body.username.toLowerCase(),
      first: req.body.first,
      last: req.body.last,
      _id: req.body._id,
      role: req.body.role,
      address: req.body.address,
      city: req.body.city
    }), req.body.password, function (err, account) {
      //err already handled(duplicate of properties)
      /// set session after successfull registeration
      if (account !== undefined) {
        passport.authenticate('local')(req, res, function () {
          if (req.session.passport) {
            /// session is on
            User.findOne({ username: req.session.passport.user })
              .then(fullUser => {
                return prepareUserToLogin(fullUser, res);
              })
              .catch(err => {
                res.json({ hasError: `We are having issues, please try again later.` });
              });
          } else {
            //No Session
            res.json({ hasError: `Couldn't log in, user created.` });
          };
        });
      } else {
        res.json({ hasError: `Invalid Properties detected.` });
      };
    });
  } catch (e) {
    res.json({ hasError: `Communication failed, please try again.` });
  };
});

// logout from user - unset session
router.get('/logout', function (req, res) {
  req.logout();
  req.session.passport = undefined;
  res.json({ message: 'Authentication closed' });
});

// user login
router.post('/login', function (req, res, next) {
  passport.authenticate('local', function (err, account) {
    // check if account is here -  false means no account exists
    if (!account) {
      User.find({ username: req.body.username }).then(user => {
        if (!user.length > 0)
          res.json({ hasError: 'Invalid Email Address.' });
        else
          res.json({ hasError: 'Invalid Password.' });
      });
    } else {
      // check if account is here -  account exists you can authenticate
      passport.authenticate('local')(req, res, function () {
        if (req.session.passport) {
          /// session is on
          User.findOne({ username: req.session.passport.user })
            .then(fullUser => {
              return prepareUserToLogin(fullUser, res);
            })
            .catch(err => {
              res.json({ hasError: `We are having issues, please try again later.` });
            });
        } else {
          //No Session
          res.json({ hasError: `Couldn't log in, please try again later.` });
        };
      });
    };
  })(req, res, next);
});

router.get('/checkSession', function (req, res) {
  if (req.session.passport) {
    /// session is on
    req.session.reload(function (err) {
      // session updated
      User.findOne({ username: req.session.passport.user })
        .populate('Orders', 'updatedAt')
        .populate('Cart', 'updatedAt')
        .then(fullUser => {
          return prepareUserToLogin(fullUser, res);
        })
        .catch(err => {
          res.json({ hasError: `Couldn't log in, please try again later.` });
        });
    });
  } else {
    //No Session
    res.json({ noUser: `s` });
  };
});

// find user, here for checking id or email existance in DB before allowing register
router.get('/find', async function (req, res) {
  if (req.query.id) {
    let rowID = await User.findOne({ _id: req.query.id });
    if (rowID) {
      /// id already exists
      res.json({ hasError: `ID is already taken.` });
    } else {
      res.send(null);
    };
  } else if (req.query.email) {
    let rowEmail = await User.findOne({ username: req.query.email.toLowerCase() });
    if (rowEmail) {
      /// email already exists
      res.json({ hasError: `Email is already taken.` });
    } else {
      res.send(null);
    };
  };
});

function prepareUserToLogin(fullUser, res) {
  let user = {};
  user.first = fullUser.first;
  user.last = fullUser.last;
  user.cart = fullUser.cart;
  user.role = fullUser.role;
  user._id = fullUser._id;
  user.username = fullUser.username;
  user.city = fullUser.city;
  user.address = fullUser.address;
  attachCartAndOrders(user, res);
};

async function attachCartAndOrders(user, res) {
  try {
    await localFunctions.populateCart(user, res)
      .then(cart => {
        if (cart) {
          //has a cart
          user.cart = cart;
        };
        return user;
      })
      .then(user => {
        Order.find({ user: user._id })
          .then(orders => {
            // anyway attach it, its an array
            user.orders = orders;
            return user;
          })
          .then(user => {
            /// sending user contains first name, role, cart,orders ,_id , and email as username
            res.json(user);
          })
      })
      .catch(err => {
        res.json({ hasError: `Couldn't log in, please try again later.` });
      });
  } catch (e) {
    res.json({ hasError: `Couldn't log in, please try again later.` });
  };
};

module.exports = router;
