const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLBoolean
} = require('graphql') // GraphQL library
const Package = require('../../models/package') // Mongoose Model
const { PackageType } = require('./package-type') // GraphQL Type

// Client Type
const ClientType = new GraphQLObjectType({
  name: 'Client',
  fields: () => ({
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

const LoginInputType = new GraphQLInputObjectType({
  name: 'LoginInput',
  fields: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) }
  }
})

const AddClientType = new GraphQLObjectType({
  name: 'AddClient',
  fields: () => ({
    name: { type: GraphQLString },
    email: { type: GraphQLString }
  })
})

const LoginOutputType = new GraphQLObjectType({
  name: 'Login',
  fields: () => ({
    success: { type: GraphQLBoolean },
    message: { type: GraphQLString },
    token: { type: GraphQLString }
  })
})

module.exports = { ClientType, LoginInputType, AddClientType, LoginOutputType }
