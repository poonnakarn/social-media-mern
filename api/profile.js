const express = require('express')
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router()
const UserModel = require('../models/UserModel')
const FollowerModel = require('../models/FollowerModel')
const ProfileModel = require('../models/ProfileModel')
const PostModel = require('../models/PostModel')

// GET PROFILE INFO
router.get('/:username', authMiddleware, async (req, res) => {
  const { username } = req.params

  try {
    const user = await UserModel.findOne({ username: username.toLowerCase() })
    if (!user) {
      return res.status(404).send('User not found')
    }

    const profile = await ProfileModel.findOne({ user: user._id }).populate(
      'user'
    )
    const profileFollowStats = await FollowerModel.findOne({ user: user._id })

    return res.json({
      profile,
      followersLength:
        profileFollowStats.followers.length > 0
          ? profileFollowStats.followers.length
          : 0,
      followingLength:
        profileFollowStats.following.length > 0
          ? profileFollowStats.following.length
          : 0,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

// GET POSTS OF A USER
router.get('/posts/:username', authMiddleware, async (req, res) => {
  const { username } = req.params

  try {
    const user = await UserModel.findOne({ username: username.toLowerCase() })
    if (!user) {
      return res.status(404).send('User not found')
    }

    const posts = await PostModel.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('user')
      .populate('comments.user')

    return res.json(posts)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

// GET FOLLOWERS
router.get('/followers/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params
  try {
    const user = await FollowerModel.findOne({ user: userId }).populate(
      'followers.user'
    )

    return res.json(user.followers)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

// GET FOLLOWING
router.get('/following/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params
  try {
    const user = await FollowerModel.findOne({ user: userId }).populate(
      'following.user'
    )

    return res.json(user.following)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

// FOLLOW A USER
router.post('/follow/:userToFollowId', authMiddleware, async (req, res) => {
  const { userId } = req
  const { userToFollowId } = req.params
  try {
    const user = await FollowerModel.findOne({ user: userId })
    const userToFollow = await FollowerModel.findOne({ user: userToFollowId })
    // console.log(userToFollow)

    if (!user || !userToFollow) return res.status(404).send('User not found')

    const isFollowing =
      user.following.length > 0 &&
      user.following.filter(
        (following) => following.user.toString() === userToFollowId
      ).length > 0

    if (isFollowing) {
      // already follow
      return res.status(401).send('User already followed')
    }

    await user.following.unshift({ user: userToFollowId })
    await user.save()

    await userToFollow.followers.unshift({ user: userId })
    await userToFollow.save()

    return res.status(200).send('Success')
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

// UNFOLLOW A USER
router.put('/unfollow/:userToUnFollowId', authMiddleware, async (req, res) => {
  const { userId } = req
  const { userToUnFollowId } = req.params

  try {
    const user = await FollowerModel.findOne({ user: userId })
    const userToUnFollow = await FollowerModel.findOne({
      user: userToUnFollowId,
    })

    if (!user || !userToUnFollow) return res.status(404).send('User not found')

    const isFollowing =
      user.following.length > 0 &&
      user.following.filter(
        (following) => following.user.toString() === userToUnFollowId
      ).length === 0

    if (isFollowing) return res.status(401).send('User not followed previously')

    const removeFollowing = user.following
      .map((following) => following.user.toString())
      .indexOf(userToUnFollowId)

    await user.following.splice(removeFollowing, 1)
    await user.save()

    const removeFollower = userToUnFollow.followers
      .map((follower) => follower.user.toString())
      .indexOf(userId)

    await userToUnFollow.followers.splice(removeFollower, 1)
    await userToUnFollow.save()

    return res.status(200).send('Success')
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

// UPDATE PROFILE
router.post('/update', authMiddleware, async (req, res) => {
  try {
    const { userId } = req

    const { bio, facebook, youtube, twitter, instagram, profilePicUrl } =
      req.body.user

    let profileFields = {}
    profileFields.user = userId
    profileFields.bio = bio
    profileFields.social = {}
    if (facebook) profileFields.social.facebook = facebook
    if (youtube) profileFields.social.youtube = youtube
    if (instagram) profileFields.social.instagram = instagram
    if (twitter) profileFields.social.twitter = twitter

    await ProfileModel.findOneAndUpdate(
      { user: userId },
      { $set: profileFields },
      { new: true }
    )

    if (profilePicUrl) {
      const user = await UserModel.findById(userId)
      user.profilePicUrl = profilePicUrl
      await user.save()
    }

    return res.status(200).send('Success')
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

// UPDATE PASSWORD
router.post('/settings/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (newPassword.length < 6) {
      return res.status(401).send('Password must be at least 6 characters')
    }

    const user = await UserModel.findById(req.userId).select('+password')

    const isPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isPassword) {
      // wrong password
      return res.status(401).send('Invalid Password')
    }

    // save new password
    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()
    return res.status(200).send('Success')
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

// UPDATE MESSAGE POPUP SETTINGS
router.post('/settings/messagePopup', authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId)

    if (user.newMessagePopup) {
      user.newMessagePopup = false
      await user.save()
    } else {
      user.newMessagePopup = true
      await user.save()
    }

    return res.status(200).send('Success')
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

module.exports = router
