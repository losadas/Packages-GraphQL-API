const { PackageType } = require('../types/package-types') // GraphQL Type
const Package = require('../../models/package') // Mongoose Model
const { GraphQLID, GraphQLList, GraphQLNonNull } = require('graphql') // GraphQL library
const { isLoggedIn } = require('../helpers/verifications-token') // Auth library
const mongoose = require('mongoose')

// Project Queries
const packageQueries = {
  package: {
    type: PackageType,
    args: { id: { type: new GraphQLNonNull(GraphQLID) } },
    resolve: async (parent, args, context) => {
      // Check if client is logged in
      const currentClient = isLoggedIn(context.headers.authorization)
      try {
        const validID = mongoose.Types.ObjectId.isValid(args.id)
        if (!validID) {
          throw new Error('Invalid ID')
        }
        const packageFound = await Package.findOne({
          clientID: currentClient._id,
          _id: args.id
        }).exec()
        if (!packageFound) {
          throw new Error('Package not found')
        }
        return packageFound
      } catch (error) {
        throw new Error('Error fetching package: ' + error.message)
      }
    }
  },
  packages: {
    type: new GraphQLList(PackageType),
    resolve: async (parent, args, context) => {
      // Check if client is logged in
      const currentClient = isLoggedIn(context.headers.authorization)
      try {
        const packagesFound = await Package.find({
          clientID: currentClient._id
        }).exec()
        if (!packagesFound) {
          throw new Error('This client does not have packages')
        }
        return packagesFound
      } catch (error) {
        throw new Error('Error fetching packages: ' + error.message)
      }
    }
  }
}

module.exports = {
  packageQueries
}
