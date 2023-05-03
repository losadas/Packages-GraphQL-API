const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList
} = require('graphql') // GraphQL library
const Package = require('../../models/package') // Mongoose Model
const { PackageType } = require('./package-type') // GraphQL Type

// Client Type
const ClientType = new GraphQLObjectType({
  name: 'Client',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    packages: {
      type: new GraphQLList(PackageType),
      resolve(parent, args) {
        return Package.find({ clientID: parent.id })
      }
    }
  })
})

module.exports = { ClientType }
