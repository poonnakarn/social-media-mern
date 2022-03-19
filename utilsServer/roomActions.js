const users = []

const addUser = async (userId, socketId) => {
  // Check if user is already connected
  const user = users.find((user) => user.userId === userId)

  if (user && user.socketId === socketId) {
    // SocketId already exits
    return users
  } else {
    if (user && user.socketId !== socketId) {
      await removeUser(user.socketId)
    }

    const newUser = { userId, socketId }

    user.push(newUser)

    return users
  }
}

const removeUser = async (socketId) => {
  const indexOf = users
    .map((user) => user.socketId === socketId)
    .indexOf(socketId)

  user.splice(indexOf, 1)

  return
}

module.exports = { addUser, removeUser }
