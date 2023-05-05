const {
  GraphQLObjectType,
  GraphQLString,
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

// Client login input and output types
const LoginInputType = new GraphQLInputObjectType({
  name: 'LoginInput',
  fields: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) }
  }
})

const LoginOutputType = new GraphQLObjectType({
  name: 'LoginOutput',
  fields: () => ({
    success: { type: GraphQLBoolean },
    message: { type: GraphQLString },
    token: { type: GraphQLString }
  })
})

// Client register input and output types
const RegisterInputType = new GraphQLInputObjectType({
  name: 'RegisterInput',
  fields: {
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) }
  }
})

const RegisterOutputType = LoginOutputType

// Client update input and output types
const UpdateClientInputType = new GraphQLInputObjectType({
  name: 'UpdateInput',
  fields: {
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString }
  }
})
const UpdateClientOutputType = new GraphQLObjectType({
  name: 'UpdateOutput',
  fields: () => ({
    success: { type: GraphQLBoolean },
    message: { type: GraphQLString }
  })
})

// Client delete input and output types
const DeleteClientOutputType = UpdateClientOutputType

const DeleteAllClientsOutputType = DeleteClientOutputType

module.exports = {
  ClientType,
  LoginInputType,
  RegisterOutputType,
  LoginOutputType,
  RegisterInputType,
  UpdateClientOutputType,
  UpdateClientInputType,
  DeleteClientOutputType,
  DeleteAllClientsOutputType
}
