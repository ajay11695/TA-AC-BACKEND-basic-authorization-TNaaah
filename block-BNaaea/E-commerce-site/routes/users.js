var express = require('express');
var router = express.Router();
var User = require('../model/User')
var Product = require('../model/Product')
var auth=require('../middleware/auth')

/* GET users listing. */
// fetching all product users
router.get('/', (req, res, next) => {
  if (req.session.userId) {
    Product.find({}, (err, products) => {
      User.findById({ _id: req.session.userId }, (err, user) => {
        if (err) return next(err)
        return res.render('dashboard', { products, user })
      })
    })
  }
})

// search category product
router.post('/category', (req, res, next) => {
  console.log(req.body)
  if (req.body.category === 'All') {
    res.redirect('/users')
  } else {
    Product.find({ category: req.body.category }, (err, products) => {
        return res.render('dashboard.ejs', { products})
    })
  }
})

// find cart
router.get('/cart', (req, res, next) => {
  if(req.session.userId){
    User.findById(req.session.userId).populate('cart').exec((err,user )=>{
      if(err) return next(err)
      console.log(user,'hjhj')
    return res.render('addCart',{user})
    })
  }

  console.log(req.session.userId,'jkl');
})

// registration
router.get('/registration', function (req, res, next) {
  var error = req.flash('error')[0]
  res.render('registration', { error });
});


router.post('/registration', function (req, res, next) {
  req.body.isBlock=false
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
  console.log(req.body)
  var { email, password } = req.body
  if (!email || !password) {
    req.flash('error', 'Please enter email/password')
    return res.redirect('/users/login')
  }
  // use Admin
  else if (email === 'ajayrajput9554@gmail.com') {
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
          res.redirect('/admin')
        }
      })
    })
  }
  // use users
  else {
    User.findOne({ email }, (err, user) => {
      if (err) return next(err)
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
          res.redirect('/users')
          console.log('esdrftgyhujik')
        }
      })
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

// fetching single article

router.get('/:id', (req, res, next) => {
  var id = req.params.id
  if (req.session.userId) {
    Product.findById(id, (err, product) => {
        if (err) return next(err)
        res.render('productDetail', { product })
      })
  } else {
    Product.findById(id, (err, product) => {
      res.render('productDetail', { product })
    })
  }

})

// increment likes

router.get('/:id/likes', (req, res, next) => {
  var id = req.params.id
  if (req.session.userId) {
    Product.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, updatelikes) => {
      if (err) return next(err)
      res.redirect('/users/' + id)
    })
  } else {
    res.redirect('/users/registration')
  }
})

// increment dislikes

router.get('/:id/dislikes', (req, res, next) => {
  var id = req.params.id
  if (req.session.userId) {
    Product.findByIdAndUpdate(id, { $inc: { dislikes: 1 } }, (err, updatedislikes) => {
      if (err) return next(err)
      res.redirect('/users/' + id)
    })
  } else {
    res.redirect('/users/registration')
  }
})



// add to cart
router.get('/:id/cart',(req,res,next)=>{
  var id = req.params.id
  if (req.session.userId) {
    Product.findById(id, (err, product) => {
      if (err) return next(err)
      console.log(req.session.userId)
          User.findByIdAndUpdate({_id:req.session.userId},{$push:{cart:product._id}},{new:true},(err,user)=>{
            res.redirect('/users/cart')
          })
        })
  
  } else {
    res.redirect('/users/login')
  }
})

// buy now
router.get('/:id/buy',(req,res,next)=>{
  var id = req.params.id
  if (req.session.userId) {
    Product.findById(id, (err, product) => {
      if (err) return next(err)
        res.render('buynow',{product })
      })
  } else {
    res.redirect('/users/login')
  }
})

// remove cart
router.get('/:id/remove',(req,res,next)=>{
  User.findByIdAndUpdate({_id:req.session.userId},{$pull:{cart:req.params.id}},(err,user)=>{
    res.redirect('/users/cart')
  })
   
})

module.exports = router;
