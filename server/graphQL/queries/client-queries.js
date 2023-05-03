const { ClientType } = require('../types/client-type') // GraphQL Type
const Client = require('../../models/client') // Mongoose Model
const { GraphQLID, GraphQLList, GraphQLString } = require('graphql') // GraphQL library
const jwt = require('jsonwebtoken')

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
    return decoded
  } catch (err) {
    return null
  }
}

// Client Queries
const clientQueries = {
  client: {
    type: ClientType,
    resolve(parent, args, context) {
      const isloggedIn = verifyToken(context.token)
      if (!isloggedIn) {
        throw new Error('Unauthorized')
      }
      return Client.findById(isloggedIn._id)
    }
  },
  clients: {
    type: new GraphQLList(ClientType),
    resolve(parent, args) {
      return Client.find({})
    }
  }
}

module.exports = {
  clientQueries
}
