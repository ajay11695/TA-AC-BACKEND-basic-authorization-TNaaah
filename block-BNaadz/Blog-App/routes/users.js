var express = require('express');
var router = express.Router();
var User = require('../model/User')
var articles=require('../model/article')
var User=require('../model/User')

/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log(req.session)
  User.findById({ _id: req.session.userId }, (err, user) => {
  res.render('user',{user});
  })
});

// registration
router.get('/registration', function (req, res, next) {
  var error = req.flash('error')[0]
  res.render('registration', { error });
});


router.post('/registration', function (req, res, next) {
  User.create(req.body, (err, user) => {

    if (err) {

      if (err.name === 'MongoServerError') {
        req.flash('error', 'This email is taken')
        return res.redirect('/users/registration')
      }
      if (err.name === 'ValidationError') {
        req.flash('error', err.message)
        return res.redirect('/users/registration')
      }

    }
    res.redirect('/users/login')
  })
});

// login
router.get('/login', function (req, res, next) {
  var error = req.flash('error')[0]
  res.render('login', { error });
});


router.post('/login', function (req, res, next) {
  var { email, password } = req.body
  if (!email || !password) {
    req.flash('error', 'Please enter email/password')
    return res.redirect('/users/login')
  }

  User.findOne({ email }, (err, user) => {
    if (err) return next(err)
    // no user
    if (!user) {
      req.flash('error', 'This email is not registered')
      return res.redirect('/users/login')
    }
    // compare password
    user.verifyPassword(password, (err, result) => {
      if (err) return next(err)
      // console.log(result)
      if (!result) {
        req.flash('error', 'Incorrect password')
        return res.redirect('/users/login')
      }
      else {

        // persist logged in user information
        req.session.userId = user.id
        res.redirect('/users/dashboard')
      }
    })
  })
});


router.get('/dashboard', (req, res, next) => {
  if (req.session.userId) {
    return res.redirect('/articles')
  }
  return res.redirect('/users/login')
})


// logout
router.get('/logout', (req, res, next) => {
  // res.clearCookie('connect.sid')
  req.session.destroy()
  res.redirect('/')
})

module.exports = router;
