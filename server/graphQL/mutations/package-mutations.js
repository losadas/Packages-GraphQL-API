const Package = require('../../models/package') // Mongoose Model
const { PackageType } = require('../types/package-type') // GraphQL Type
const {
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLInputObjectType
} = require('graphql') // GraphQL library

// Project Mutations
const packageMutations = {
  // Add Project
  addPackage: {
    type: PackageType,
    args: {
      specs: {
        type: new GraphQLInputObjectType({
          name: 'Specs',
          fields: () => ({
            large: { type: GraphQLString },
            width: { type: GraphQLString },
            height: { type: GraphQLString },
            weight: { type: GraphQLString }
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
      },
      clientID: { type: GraphQLNonNull(GraphQLID) }
    },
    resolve(parent, args) {
      const package = new Package({
        specs: args.specs,
        date: args.date,
        time: args.time,
        pickCity: args.pickCity,
        pickAddress: args.pickAddress,
        destCity: args.destCity,
        destAddress: args.destAddress,
        nameDest: args.nameDest,
        nitDest: args.nitDest,
        status: args.status,
        clientID: args.clientID
      })
      return package.save() // Save project to database
    }
  },

  // Update Project
  updatePackage: {
    type: PackageType,
    args: {
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
    },
    resolve(parent, args) {
      return Package.findByIdAndUpdate(
        args.id,
        {
          specs: args.specs,
          date: args.date,
          time: args.time,
          pickCity: args.pickCity,
          pickAddress: args.pickAddress,
          destCity: args.destCity,
          destAddress: args.destAddress,
          nameDest: args.nameDest,
          nitDest: args.nitDest,
          status: args.status
        },
        { new: true }
      )
    }
  },

  // Delete Project
  deletePackage: {
    type: PackageType,
    args: {
      id: { type: GraphQLNonNull(GraphQLID) }
    },
    resolve(parent, args) {
      return Package.findByIdAndDelete(args.id) // Delete project
    }
  }
}

module.exports = {
  packageMutations
}
