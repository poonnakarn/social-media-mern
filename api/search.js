const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')

const UserModel = require('../models/UserModel')

router.get('/:searchText', authMiddleware, async (req, res) => {
  const { searchText } = req.params

  if (searchText.length === 0) return

  try {
    let userPattern = new RegExp(`^${searchText}`)

    const results = await UserModel.find({
      name: { $regex: userPattern, $options: 'i' },
    })

    res.json(results)
  } catch (error) {
    console.error(error)
    return res.status(500).send(`Server error`)
  }
})

module.exports = router
