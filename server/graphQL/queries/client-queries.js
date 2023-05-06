const { ClientType } = require('../types/client-types') // GraphQL Type
const Client = require('../../models/client') // Mongoose Model
const { GraphQLList } = require('graphql') // GraphQL library
const { isLoggedIn } = require('../helpers/verifications-token') // Auth library

// Client Queries
const clientQueries = {
  // Get client logged in
  client: {
    type: ClientType,
    resolve: async (parent, args, context) => {
      const currentClient = isLoggedIn(context.headers.authorization)
      try {
        const client = await Client.findById(currentClient._id).exec()
        if (!client) {
          throw new Error('Client not found')
        }
        return client
      } catch (error) {
        throw new Error('Error fetching client: ' + error.message)
      }
    }
  },

  // Get all clients (for testing purposes)
  clients: {
    type: new GraphQLList(ClientType),
    resolve: async () => {
      try {
        const clients = await Client.find({})
        if (!clients) {
          throw new Error('Clients not found')
        }
        return clients
      } catch (error) {
        throw new Error('Error fetching clients: ' + error.message)
      }
    }
  }
}

module.exports = {
  clientQueries
}
