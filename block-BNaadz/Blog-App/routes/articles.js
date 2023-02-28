var express = require('express');
var router = express.Router();
var articles = require('../model/article')
var comments = require('../model/comment')
var User = require('../model/User')
var auth=require('../middleware/auth')

/* GET article listing. */
router.get('/', (req, res, next) => {
      articles.find({}, req.body, (err, articles) => {
      if (err) return next(err)
        res.render('listArticle.ejs', { articles})
    })

})

// created article form

router.get('/new',auth.loggedInUser, (req, res) => {
  res.render('createArticle')
})

// fetching single article

router.get('/:id', (req, res, next) => {
  var id = req.params.id
     articles.findById(id).populate('comments').populate('author','name email').exec((err, articleDetail) => {
        if (err) return next(err)
        res.render('articleDetail', { articleDetail })
      })
})

// add to middleware

router.use(auth.loggedInUser)

// created article

router.post('/', (req, res, next) => {
  req.body.tags = req.body.tags.trim().split(' ')
  req.body.author=req.user._id
  articles.create(req.body, (err, createArticle) => {
    if (err) return next()
      User.findOneAndUpdate({ userId: req.session.userId }, { $push: { articleId: createArticle._id } }, (err, updateuser) => {
        res.redirect('/articles')
    })
  })
})



// edit article

router.get('/:id/edit', (req, res, next) => {
  articles.findById(req.params.id).populate('author','name email').exec((err, article) => {
    if (article.author.email == req.user.email) {
      console.log(article.author.email,req.user.email)
      res.render('updateArticle', { article })
    } else {
      res.redirect('/articles/' + req.params.id)
    }
  })
})

// update article

router.post('/:id', (req, res, next) => {
  var id = req.params.id
  req.body.tags = req.body.tags.trim().split(' ')
  articles.findByIdAndUpdate(id, req.body, { new: true }, (err, update) => {
    if (err) return next(err)
    res.redirect('/articles/' + id)
  })
})

// delete article

router.get('/:id/delete', (req, res, next) => {
  articles.findById(req.params.id).populate('author','name email').exec((err, article) => {
    if (article.author.email == req.user.email) {
      articles.findByIdAndDelete(req.params.id, req.body, (err, article) => {
        comments.deleteMany({ bookId: article.id }, (err, deleteAllcomment) => {
          if (err) return next(err)
          res.redirect('/articles')
        })
      })
    } else {
      res.redirect('/articles/' + req.params.id)
    }

  })
})

// increment likes

router.get('/:id/likes', (req, res, next) => {
  var id = req.params.id
  articles.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, updatelikes) => {
    if (err) return next(err)
    res.redirect('/articles/' + id)
  })
})

// increment dislikes

router.get('/:id/dislikes', (req, res, next) => {
  var id = req.params.id
    articles.findByIdAndUpdate(id, { $inc: { dislikes: 1 } }, (err, updatedislikes) => {
      if (err) return next(err)
      res.redirect('/articles/' + id)
    })
})

// add comment
router.post('/:id/comments', (req, res, next) => {
  var id = req.params.id
  req.body.articleId = id
  req.body.userId=req.user._id
  comments.create(req.body, (err, comment) => {
    articles.findByIdAndUpdate(id, { $push: { comments: comment } }, (err, article) => {
        User.findOneAndUpdate({ userId: req.session.userId }, { $push: { commentId: comment._id } }, (err, updateuser) => {
          res.redirect('/articles/' + id)
        })
      })
  })
})

module.exports = router;
