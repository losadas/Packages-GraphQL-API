const jwt = require('jsonwebtoken')

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
    return decoded
  } catch (err) {
    return null
  }
}

const createToken = (id) => {
  const token = jwt.sign({ _id: id }, process.env.TOKEN_SECRET)
  return token
}

const isLoggedIn = (token) => {
  const isLoggedIn = verifyToken(token)
  if (!isLoggedIn) {
    throw new Error('Unauthorized')
  }
  return isLoggedIn
}

module.exports = {
  createToken,
  isLoggedIn,
  verifyToken
}
