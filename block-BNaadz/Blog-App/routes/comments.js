var express = require('express');
var router = express.Router();
var articles = require('../model/article')
var comments = require('../model/comment')
var User = require('../model/User')

// edit comment
router.get('/:id/edit', (req, res, next) => {
  var id = req.params.id
  comments.findById(id).populate('userId','name email').exec((err, comment) => {
    if (comment.userId.email === req.user.email) {
      if (err) return next(err)
      res.render('updateComment', { comment })
    } else {
      res.redirect('/articles/' + comment.articleId)
    }

  })
})

// update comment
router.post('/:id', (req, res, next) => {
  console.log(req.body)
  comments.findByIdAndUpdate(req.params.id, req.body, (err, updateComment) => {
    if (err) return next(err)
    res.redirect('/articles/' + updateComment.articleId)
  })
})

// delete comment
router.get('/:id/delete', (req, res, next) => {
  var id = req.params.id
  comments.findById(id).populate('userId','name email').exec((err, comment) => {
    if (comment.userId.email === req.user.email) {
      comments.findByIdAndDelete(req.params.id, (err, deleteComment) => {
        articles.findByIdAndUpdate(deleteComment.articleId, { $pull: { comments: deleteComment.id } }, (err, articles) => {
          if (err) return next(err)
          res.redirect('/articles/' + articles.id)
        })
      })
    }else{
      res.redirect('/articles/' + comment.articleId)
    }
  })

})

// increment likes

router.get('/:id/likes', (req, res, next) => {
  var id = req.params.id
  comments.findByIdAndUpdate(id, { $inc: { likes: 1 } }, (err, updatelikes) => {
    if (err) return next(err)
    res.redirect('/articles/' + updatelikes.articleId)
  })
})

// increment dislikes

router.get('/:id/dislikes', (req, res, next) => {
  var id = req.params.id
  comments.findByIdAndUpdate(id, { $inc: { dislikes: 1 } }, (err, updatedislikes) => {
    if (err) return next(err)
    res.redirect('/articles/' + updatedislikes.articleId)
  })

})

module.exports = router