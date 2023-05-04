const { ClientType } = require('../types/client-types') // GraphQL Type
const Client = require('../../models/client') // Mongoose Model
const { GraphQLList } = require('graphql') // GraphQL library
const { isLoggedIn } = require('../helpers/verifications-token') // Auth library

// Client Queries
const clientQueries = {
  // Get client logged in
  client: {
    type: ClientType,
    resolve(parent, args, context) {
      return Client.findById(isLoggedIn(context.token)._id)
    }
  },

  // Get all clients (for testing purposes)
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
