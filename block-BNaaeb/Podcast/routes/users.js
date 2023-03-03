var express = require('express');
const { findById } = require('../model/Podcast');
var router = express.Router();

var User=require('../model/User')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// registration
router.get('/registration', function (req, res, next) {
  var error = req.flash('error')[0]
  res.render('register', { error });
});


router.post('/registration', function (req, res, next) {
  User.create(req.body)
   .then(()=>{
    return res.redirect('/users/login')
   } )
   .catch((err)=>{
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
   }) 
    
   
  
});

// login
router.get('/login', function (req, res, next) {
  var error = req.flash('error')[0]
  res.render('login', { error });
});


router.post('/login', function (req, res, next) {
  console.log(req.body)
  var { email, password } = req.body
  if (!email || !password) {
    req.flash('error', 'Please enter email/password')
    return res.redirect('/users/login')
  }
  // use Admin
  else if (email === 'ajayrajput9554@gmail.com') {
    User.findOne({ email })
    .then((user)=>{
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
          res.redirect('/')
        }
      })
    })
      .catch((err)=>{
        if (err) return next(err)
      })
     
  }
    // use users
    else {
      User.findOne({ email })
      .then((user)=>{
         // no user
        if (!user) {
          req.flash('error', 'This email is not registered')
          return res.redirect('/users/login')
        }

         //block user
       if(user.isBlock == true){
        req.flash('error', 'you are blocked & contact to admin')
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
            res.redirect('/')
          }
        })
      })
        .catch((err)=>{
          if (err) return next(err)
        })
    }
  });

  // logout
router.get('/logout', (req, res, next) => {
  // res.clearCookie('connect.sid')
  req.session.destroy()
  // console.log(res.session)
  res.redirect('/')
})

// go to subcription form
router.get('/subcription',(req,res)=>{
  res.render('subcription')
})

// subcription update
router.post('/subcription',(req,res,next)=>{
  console.log(req.body,req.user)
  User.findByIdAndUpdate({_id:req.user._id},{subcription:req.body.subcription},{new:true})
  .then((user)=>{
    console.log(user,'sub')
    res.redirect('/podcast')
  })
  .catch((err)=>{
    next(err)
  })
})
  

module.exports = router;
