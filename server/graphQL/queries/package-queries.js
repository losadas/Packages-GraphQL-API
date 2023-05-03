const { PackageType } = require('../types/package-type') // GraphQL Type
const Package = require('../../models/package') // Mongoose Model
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

// Project Queries
const packageQueries = {
  package: {
    type: PackageType,
    args: { id: { type: GraphQLID }, token: { type: GraphQLString} },
    resolve(parent, args) {
      const loggedIn = verifyToken(args.token)
      if (!loggedIn) {
        throw new Error('Unauthorized')
      }
      return Package.findById(args.id)
    }
  },
  packages: {
    type: new GraphQLList(PackageType),
    args: { token: { type: GraphQLString}},
    resolve(parent, args) {
      const loggedIn = verifyToken(args.token)
      if (!loggedIn) {
        throw new Error('Unauthorized')
      }
      return Package.find({})
    }
  }
}

module.exports = {
  packageQueries
}
