const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInputObjectType
} = require('graphql') // GraphQL library
const Client = require('../../models/client') // Mongoose Model

// Specs Type
const Specs = new GraphQLObjectType({
  name: 'SpecsType',
  fields: () => ({
    large: { type: GraphQLString },
    width: { type: GraphQLString },
    height: { type: GraphQLString },
    weight: { type: GraphQLString }
  })
})

// Package Type
const PackageType = new GraphQLObjectType({
  name: 'Package',
  fields: () => ({
    id: { type: GraphQLID },
    specs: { type: Specs },
    date: { type: GraphQLString },
    time: { type: GraphQLString },
    pickCity: { type: GraphQLString },
    pickAddress: { type: GraphQLString },
    destCity: { type: GraphQLString },
    destAddress: { type: GraphQLString },
    nameDest: { type: GraphQLString },
    nitDest: { type: GraphQLString },
    status: { type: GraphQLString },
    client: {
      type: require('./client-types').ClientType, // GraphQL Type
      resolve(parent, args) {
        return Client.findById(parent.clientID)
      }
    }
  })
})

module.exports = { PackageType, Specs }
