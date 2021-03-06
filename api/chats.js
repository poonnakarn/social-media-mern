const express = require('express')
const router = express.Router()
const ChatModel = require('../models/ChatModel')
const authMiddleware = require('../middleware/authMiddleware')
const UserModel = require('../models/UserModel')

// GET ALL CHATS
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { userId } = req
    const user = await ChatModel.findOne({ user: userId }).populate(
      'chats.messagesWith'
    )

    let chatsToBeSent = []

    // Left columm shows only the most recent message
    if (user.chats.length > 0) {
      chatsToBeSent = await user.chats.map((chat) => ({
        messagesWith: chat.messagesWith._id,
        name: chat.messagesWith.name,
        profilePicUrl: chat.messagesWith.profilePicUrl,
        lastMessage: chat.messages[chat.messages.length - 1].msg,
        date: chat.messages[chat.messages.length - 1].date,
      }))
    }

    return res.json(chatsToBeSent)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server Error`)
  }
})

// GET USER INFO
router.get('/user/:userToFindId', authMiddleware, async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userToFindId)

    if (!user) {
      return res.status(404).send('No User Found')
    }

    return res.json({ name: user.name, profilePicUrl: user.profilePicUrl })
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server Error`)
  }
})

module.exports = router
