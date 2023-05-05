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
  try {
    const token = jwt.sign({ _id: id }, process.env.TOKEN_SECRET)
    return token
  } catch (error) {
    throw new Error('Error creating token: ' + error.message)
  }
}

const isLoggedIn = (token) => {
  try {
    const isLoggedIn = verifyToken(token)
    if (!isLoggedIn) throw new Error('Unauthorized')
    return isLoggedIn
  } catch (error) {
    throw new Error('Error verifying token: ' + error.message)
  }
}

module.exports = {
  createToken,
  isLoggedIn,
  verifyToken
}
