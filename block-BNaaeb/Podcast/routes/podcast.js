var express = require('express');
var router = express.Router();
var auth = require('../middleware/auth')

var multer = require('multer')
var fs = require('fs')

var Podcast = require('../model/Podcast')
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

// list of podcast
router.get('/', (req, res, next) => {
  if (!req.user) {
    Podcast.find({ subcription: "Free" })
      .then((podcasts) => {
        res.render('dashboard', { podcasts })
      })
      .catch((err) => {
        next(err)
      })
  } else {
    if (req.user.isAdmin) {
      Podcast.find({})
        .then((podcasts) => {
          res.render('dashboard', { podcasts })
        })
        .catch((err) => {
          next(err)
        })
    } else {
      if (req.user.subcription == 'Free') {
        Podcast.find({ subcription: "Free" })
          .then((podcasts) => {
            res.render('dashboard', { podcasts })
          })
          .catch((err) => {
            next(err)
          })
      } else if (req.user.subcription == 'VIP') {
        Podcast.find({subcription:{$nin:'Premium'}})
          .then((podcasts) => {
            res.render('dashboard', { podcasts })
          })
          .catch((err) => {
            next(err)
          })
      } else {
        Podcast.find({})
          .then((podcasts) => {
            res.render('dashboard', { podcasts })
          })
          .catch((err) => {
            next(err)
          })
      }
    }
  }


})

// create podcast form
router.get('/new', (req, res, next) => {
  res.render('createPodcast')
})

// created podcast
router.post('/', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }]), (req, res, next) => {
  console.log(req.files)
  req.body.audio = req.files.audio[0].filename
  req.body.image = req.files.image[0].filename
  req.body.userId = req.user._id
  Podcast.create(req.body)
    .then((podcast) => {
      User.findByIdAndUpdate({ _id: req.user._id }, { $push: { podcastId: podcast._id } })
      return res.redirect('/podcast')
    })
    .catch((err) => {
      return next(err)
    })
})

// single fetching podcast
router.get('/:id', (req, res, next) => {
  var id = req.params.id
  Podcast.findById(id)
    .then((podcast) => {
      res.render('podcastDetail', { podcast })
    })
    .catch((err) => {
      next(err)
    })
})

// router.use(auth.loggedInUser)

// likes
router.get('/:id/likes', (req, res, next) => {
  var id = req.params.id
  Podcast.findByIdAndUpdate({ _id: id }, { $inc: { likes: 1 } })
    .then(res.redirect('/podcast/' + id))
    .catch((err) => {
      next(err)
    })
})

// dislikes
router.get('/:id/dislikes', (req, res, next) => {
  var id = req.params.id
  Podcast.findByIdAndUpdate({ _id: id }, { $inc: { dislikes: 1 } })
    .then(res.redirect('/podcast/' + id))
    .catch((err) => {
      next(err)
    })
})

// edit podcast form
router.get('/:id/edit', (req, res, next) => {
  var id = req.params.id
  Podcast.findById(id)
    .then((podcast) => {
      res.render('updatePodcast', { podcast })
    })
    .catch((err) => {
      next(err)
    })
})

// update podcast

router.post('/:id', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }]), (req, res, next) => {

  console.log(Object.keys(req.files).length === 0,'lll')
  console.log(req.body)
  var id = req.params.id

  var newImage = ''
  var newAudio = ''
  // console.log(newImage,newAudio)
  if (Object.keys(req.files).length !== 0) {
    var audio = req.files.audio
    var image = req.files.image

    if (image) {
      newImage = image[0].filename;
      try {

        //delete th old img
        fs.unlinkSync('./public/images/' + req.body.image)
      } catch (error) {
        console.log(error)
      }
    }
    if (audio) {
      newAudio = audio[0].filename;
      try {

        //delete th old audio
        fs.unlinkSync('./public/images/' + req.body.audio)
      } catch (error) {
        console.log(error)
      }
    }
  } else {
    console.log('dfghjk')
    newImage = req.body.image
    newAudio = req.body.audio
  }
  console.log(newImage, newAudio,'sedrftgyhujiko')
  req.body.image = newImage
  req.body.audio = newAudio
  Podcast.findByIdAndUpdate(id, req.body)
  .then(()=>{ res.redirect('/podcast/' + id)})
  .catch((err)=>{
    next(err)
  })
})

// delete podcast
router.get('/:id/delete',(req,res,next)=>{
  var id = req.params.id
  Podcast.findByIdAndDelete(id)
  .then((podcast)=>{
    if(podcast.image != ''){
      fs.unlinkSync('./public/images/' + podcast.image)
    }

    if(podcast.audio != ''){
      fs.unlinkSync('./public/images/' + podcast.audio)
    }
    res.redirect('/podcast')
  })
  .catch((err)=>{
    next(err)
  })
})

module.exports = router