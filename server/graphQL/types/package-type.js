const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLBoolean
} = require('graphql') // GraphQL library
const Client = require('../../models/client') // Mongoose Model

// Specs Type
const Specs = new GraphQLObjectType({
  name: 'OuputSpecs',
  fields: () => ({
    large: { type: GraphQLString },
    width: { type: GraphQLString },
    height: { type: GraphQLString },
    weight: { type: GraphQLString }
  })
})

// Package Type
const PackageType = new GraphQLObjectType({
  name: 'PackageOutput',
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

const PackageInputType = new GraphQLInputObjectType({
  name: 'PackageInput',
  fields: () => ({
    specs: {
      type: new GraphQLInputObjectType({
        name: 'InputSpecs',
        fields: () => ({
          large: { type: GraphQLNonNull(GraphQLString) },
          width: { type: GraphQLNonNull(GraphQLString) },
          height: { type: GraphQLNonNull(GraphQLString) },
          weight: { type: GraphQLNonNull(GraphQLString) }
        })
      })
    },
    date: { type: GraphQLNonNull(GraphQLString) },
    time: { type: GraphQLNonNull(GraphQLString) },
    pickCity: { type: GraphQLNonNull(GraphQLString) },
    pickAddress: { type: GraphQLNonNull(GraphQLString) },
    destCity: { type: GraphQLNonNull(GraphQLString) },
    destAddress: { type: GraphQLNonNull(GraphQLString) },
    nameDest: { type: GraphQLNonNull(GraphQLString) },
    nitDest: { type: GraphQLNonNull(GraphQLString) },
    status: {
      type: new GraphQLEnumType({
        name: 'PackageStatus',
        values: {
          new: { value: 'Saved' },
          cancel: { value: 'Canceled' },
          completed: { value: 'Completed' }
        }
      }),
      defaultValue: 'Saved'
    }
  })
})

const PackageUpdateInputType = new GraphQLInputObjectType({
  name: 'PackageUpdateInput',
  fields: () => ({
    id: { type: GraphQLNonNull(GraphQLID) },
    specs: {
      type: new GraphQLInputObjectType({
        name: 'UpdateSpecs',
        fields: () => ({
          large: { type: GraphQLString },
          width: { type: GraphQLString },
          height: { type: GraphQLString },
          weight: { type: GraphQLString }
        })
      })
    },
    date: { type: GraphQLString },
    time: { type: GraphQLString },
    pickCity: { type: GraphQLString },
    pickAddress: { type: GraphQLString },
    destCity: { type: GraphQLString },
    destAddress: { type: GraphQLString },
    nameDest: { type: GraphQLString },
    nitDest: { type: GraphQLString },
    status: {
      type: new GraphQLEnumType({
        name: 'PackageStatusUpdate',
        values: {
          new: { value: 'Saved' },
          cancel: { value: 'Canceled' },
          completed: { value: 'Completed' }
        }
      })
    }
  })
})

const UpdatePackageOutputType = new GraphQLObjectType({
  name: 'PackageUpdateOutput',
  fields: () => ({
    success: { type: GraphQLBoolean },
    message: { type: GraphQLString }
  })
})

const DeletePackageOutputType = UpdatePackageOutputType

const DeletePackagesOutputType = DeletePackageOutputType

const DeleteAllPackagesOutputType = DeletePackagesOutputType

module.exports = {
  PackageType,
  Specs,
  PackageInputType,
  PackageUpdateInputType,
  UpdatePackageOutputType,
  DeletePackageOutputType,
  DeletePackagesOutputType,
  DeleteAllPackagesOutputType
}
