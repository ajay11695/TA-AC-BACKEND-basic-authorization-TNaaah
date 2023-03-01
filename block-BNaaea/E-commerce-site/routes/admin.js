var express = require('express');
var router = express.Router();
var multer = require('multer')
var fs = require('fs')

var Product = require('../model/Product')
var User = require('../model/User')

//Configuration for Multer
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/");
  },
  filename: (req, file, cb) => {

    cb(null, Date.now() + file.originalname);
  },
});

var upload = multer({ storage: storage })

/* GET product listing. */
router.get('/', (req, res, next) => {
  if (req.session.userId) {
    Product.find({}, (err, products) => {
      if (err) return next()
      if (req.user.email == 'ajayrajput9554@gmail.com') {
        User.find({ email: { $nin: 'ajayrajput9554@gmail.com' } }, (err, users) => {
          // console.log(users)
          return res.render('listProduct.ejs', { products, users })
        })
      } else {
        res.redirect('/users')
      }
    })
  } else {
    Product.find({}, req.body, (err, products) => {
      if (err) return next()
      res.render('dashboard.ejs', { products })
    })
  }
})

// search category product
router.post('/category', (req, res, next) => {
  console.log(req.body)
  if (req.body.category === 'All') {
    res.redirect('/admin')
  } else {
    Product.find({ category: req.body.category }, (err, products) => {
      User.find({ email: { $nin: 'ajayrajput9554@gmail.com' } }, (err, users) => {
        console.log(users);
        return res.render('listProduct.ejs', { products, users })
      })
    })
  }
})

// created product form

router.get('/new', (req, res, next) => {
  return res.render('createProduct')
})

// created Product

router.post('/', upload.single('image'), (req, res, next) => {
  req.body.image = req.file.filename
  req.body.userId = req.user._id
  Product.create(req.body, (err, createProduct) => {
    if (err) return next()
    res.redirect('/admin')
  })
})

// search product
router.get('/:id', (req, res, next) => {
  var id = req.params.id
  Product.findById(id, (err, product) => {
    if (err) return next(err)
    res.render('AdminProduct', { product })
  })

})


// edit product

router.get('/:id/edit', (req, res, next) => {
  Product.findById(req.params.id, (err, product) => {
    if (err) return next(err)
    return res.render('updateProduct', { product })
  })

})

// update article

router.post('/:id', upload.single('image'), (req, res, next) => {
  var id = req.params.id
  let file = req.file
  let prev_Image = req.body.image

  let new_image = ''

  if (file) {
    new_image = req.file.filename;
    try {

      //delete th old img
      fs.unlinkSync('./public/images/' + prev_Image)
    } catch (error) {
      console.log(error)
    }
  } else {
    new_image = prev_Image
  }
  req.body.image = new_image
  Product.findByIdAndUpdate(id, req.body, (err, ubook) => {
    if (err) return next(err)
    res.redirect('/admin/' + id)
  })
})

// delete product

router.get('/:id/delete', (req, res, next) => {
  Product.findByIdAndDelete(req.params.id, (err, Dproduct) => {
    if (Dproduct.image !== '') {
      try {
        fs.unlinkSync('./public/images/' + Dproduct.image)
      } catch (error) {
        console.log(error)
      }
    } else {
      return res.redirect('/admin')
    }
    if (err) return next(err)
    res.redirect('/admin')
  })
})

// block
router.get('/:id/block',(req,res,next)=>{
  var id =req.params.id
  User.findByIdAndUpdate(id,{$set:{isBlock:true}},(err,user)=>{
    res.redirect('/admin')
  })
})


// unblock
router.get('/:id/unblock',(req,res,next)=>{
  var id =req.params.id
  User.findByIdAndUpdate(id,{$set:{isBlock:false}},(err,user)=>{
    res.redirect('/admin')
  })
})




module.exports = router;
