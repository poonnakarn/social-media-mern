const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const UserModel = require('../models/UserModel')
const PostModel = require('../models/PostModel')
const FollowerModel = require('../models/FollowerModel')
const uuid = require('uuid').v4
const {
  newLikeNotification,
  removeLikeNotification,
  newCommentNotification,
  removeCommentNotification,
} = require('../utilsServer/notificationActions')

// CREATE A POST

router.post('/', authMiddleware, async (req, res) => {
  const { text, location, picUrl } = req.body
  if (text.length < 1)
    return res.status(401).send('Text must be at least 1 character')

  try {
    const newPost = {
      user: req.userId, // from authMiddleware
      text,
    }
    if (location) newPost.location = location
    if (picUrl) newPost.picUrl = picUrl

    const post = await new PostModel(newPost).save()

    const postCreated = await PostModel.findById(post._id).populate('user')

    return res.json(postCreated)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

// @desc    Get all posts from the followed user for news feed
// @route   GET /api/posts/
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
  const { pageNumber } = req.query
  try {
    const { userId } = req
    const number = Number(pageNumber)
    const size = 8

    const loggedUser = await FollowerModel.findOne({ user: userId }).select(
      '-followers'
    )

    let posts = []

    if (number === 1) {
      if (loggedUser.following.length > 0) {
        // User is following anyone
        posts = await PostModel.find({
          user: {
            $in: [
              userId, // own posts
              ...loggedUser.following.map((following) => following.user), // user who we follow posts
            ],
          },
        })
          .limit(size)
          .sort({ createdAt: -1 })
          .populate('user')
          .populate('comments.user')
      } else {
        posts = await PostModel.find({ user: userId })
          .limit(size)
          .sort({ createdAt: -1 })
          .populate('user')
          .populate('comments.user') // only own post because not following anyone
      }
    } else {
      // Page more than 1
      const skips = size * (number - 1)
      if (loggedUser.following.length > 0) {
        // following some users
        posts = await PostModel.find({
          user: {
            $in: [
              userId, // own posts
              ...loggedUser.following.map((following) => following.user), // user who we follow posts
            ],
          },
        })
          .skip(skips)
          .limit(size)
          .sort({ createdAt: -1 })
          .populate('user')
          .populate('comments.user')
      } else {
        posts = await PostModel.find({ user: userId })
          .skip(skips)
          .limit(size)
          .sort({ createdAt: -1 })
          .populate('user')
          .populate('comments.user') // only own post because not following anyone
      }
    }

    return res.json(posts)
    // let posts

    // if (number === 1) {
    //   posts = await PostModel.find()
    //     .limit(size)
    //     .sort({ createdAt: -1 })
    //     .populate('user')
    //     .populate('comments.user')
    // } else {
    //   // skip post
    //   const skips = size * (number - 1)
    //   posts = await PostModel.find()
    //     .skip(skips)
    //     .limit(size)
    //     .sort({ createdAt: -1 })
    //     .populate('user')
    //     .populate('comments.user')
    // }

    // return res.json(posts)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

// GET SINGLE POST
router.get('/:postId', authMiddleware, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.postId)
      .populate('user')
      .populate('comments.user')

    if (!post) return res.status(404).send('Post not found')

    return res.json(post)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

// DELETE POST
router.delete('/:postId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req

    const { postId } = req.params

    const post = await PostModel.findById(postId)
    if (!post) {
      return res.status(404).send('Post not found')
    }

    const user = await UserModel.findById(userId)

    // not author of the post
    if (post.user.toString() !== userId) {
      if (user.role === 'root') {
        // admin can delete
        await post.remove()
        return res.status(200).send('Post deleted successfully')
      } else {
        return res.status(401).send('Unauthorized')
      }
    }

    await post.remove()
    return res.status(200).send('Post deleted successfully')
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

// LIKE A POST
router.post('/like/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params
    const { userId } = req

    const post = await PostModel.findById(postId)
    if (!post) return res.status(404).send('No post found')

    const isLiked =
      post.likes.filter((like) => like.user.toString() === userId).length > 0

    if (isLiked) return res.status(401).send('Post already liked')

    await post.likes.unshift({ user: userId })
    await post.save()

    if (post.user.toString() !== userId) {
      await newLikeNotification(userId, postId, post.user.toString())
    }

    return res.status(200).send('Post liked')
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

// UNLIKE A POST
router.post('/unlike/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params
    const { userId } = req

    const post = await PostModel.findById(postId)
    if (!post) return res.status(404).send('No post found')

    const isLiked =
      post.likes.filter((like) => like.user.toString() === userId).length === 0

    if (isLiked) return res.status(401).send('Post not liked before')

    const index = post.likes.map((like) => like.user.toString()).indexOf(userId)
    await post.likes.splice(index, 1)

    await post.save()

    if (post.user.toString() !== userId) {
      await removeLikeNotification(userId, postId, post.user.toString())
    }

    return res.status(200).send('Post unliked')
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

// GET ALL LIKES FOR A POST
router.get('/like/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params

    const post = await PostModel.findById(postId).populate('likes.user')
    if (!post) return res.status(404).send('No post found')

    return res.status(200).json(post.likes)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

// CREATE A COMMENT
router.post('/comment/:postId', authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params
    const { text } = req.body
    const { userId } = req

    if (text.length < 1) return res.status(401).send('Commend cannot be empty')

    const post = await PostModel.findById(postId)

    if (!post) return res.status(404).send('Post not found')

    // id, user, text, date
    const newComment = {
      _id: uuid(),
      user: userId, // from middleWare
      text,
      date: Date.now(),
    }

    await post.comments.unshift(newComment)
    await post.save()

    if (post.user.toString() !== userId) {
      await newCommentNotification(
        postId,
        newComment._id,
        userId,
        post.user.toString(),
        text
      )
    }

    return res.status(200).json(newComment._id)
  } catch {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

// DELETE A COMMENT
router.delete('/:postId/:commentId', authMiddleware, async (req, res) => {
  try {
    const { postId, commentId } = req.params
    const { userId } = req

    const post = await PostModel.findById(postId)
    if (!post) return res.status(404).send('Post not found')

    const comment = post.comments.find((comment) => comment._id === commentId)
    if (!comment) return res.status(404).send('Comment not found')

    const user = await UserModel.findById(userId)

    const deleteComment = async () => {
      const index = post.comments
        .map((comment) => comment._id)
        .indexOf(commentId)

      await post.comments.splice(index, 1)
      await post.save()

      if (post.user.toString() !== userId) {
        await removeCommentNotification(
          postId,
          commentId,
          userId,
          post.user.toString()
        )
      }
      return res.status(200).send('Comment deleted successfully')
    }

    if (comment.user.toString() !== userId) {
      if (user.role === 'root') {
        // delete the comment
        await deleteComment()
      } else {
        return res.status(401).send('Unauthorized')
      }
    }

    await deleteComment()
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

module.exports = router
