const Package = require('../../models/package') // Mongoose Model
const {
  PackageType,
  PackageInputType,
  PackageUpdateInputType,
  UpdatePackageOutputType,
  DeletePackageOutputType,
  DeletePackagesOutputType
} = require('../types/package-types') // GraphQL Type
const { GraphQLID, GraphQLNonNull } = require('graphql') // GraphQL library
const { isLoggedIn } = require('../helpers/verifications-token') // Auth library
const mongoose = require('mongoose')

// Project Mutations
const packageMutations = {
  // Add package
  addPackage: {
    type: PackageType,
    args: {
      input: { type: new GraphQLNonNull(PackageInputType) }
    },
    resolve: async (parent, args, context) => {
      const currentClient = isLoggedIn(context.headers.authorization)
      try {
        const newPackage = new Package({
          specs: args.input.specs,
          date: args.input.date,
          time: args.input.time,
          pickCity: args.input.pickCity,
          pickAddress: args.input.pickAddress,
          destCity: args.input.destCity,
          destAddress: args.input.destAddress,
          nameDest: args.input.nameDest,
          nitDest: args.input.nitDest,
          status: args.input.status,
          clientID: currentClient._id
        })
        const savedPackage = await newPackage.save()
        if (!savedPackage) throw new Error('Error saving package to database')
        return savedPackage
      } catch (error) {
        throw new Error('Error saving package: ' + error.message)
      }
    }
  },

  // Update package
  updatePackage: {
    type: UpdatePackageOutputType,
    args: {
      input: { type: new GraphQLNonNull(PackageUpdateInputType) }
    },
    resolve: async (parent, args, context) => {
      // Check if client is logged in
      const currentClient = isLoggedIn(context.headers.authorization)
      try {
        const validID = mongoose.Types.ObjectId.isValid(args.input.id)
        if (!validID) {
          throw new Error('Invalid ID')
        }
        const packageFound = await Package.findOne({
          clientID: currentClient._id,
          _id: args.input.id
        }).exec()
        if (!packageFound) {
          throw new Error('Package not found')
        }
        if (Object.keys(args.input).length === 1 && args.input.id) {
          return { success: true, message: 'Anything to update' }
        }

        const updatedPackage = await Package.findOneAndUpdate(
          { clientID: currentClient._id, _id: args.input.id },
          {
            specs: args.input.specs,
            date: args.input.date,
            time: args.input.time,
            pickCity: args.input.pickCity,
            pickAddress: args.input.pickAddress,
            destCity: args.input.destCity,
            destAddress: args.input.destAddress,
            nameDest: args.input.nameDest,
            nitDest: args.input.nitDest,
            status: args.input.status
          },
          { new: true }
        )
        if (!updatedPackage)
          throw new Error('Error updating package to database')
        return { success: true, message: 'Package updated successfully' }
      } catch (error) {
        throw new Error('Error updating package: ' + error.message)
      }
    }
  },

  // Delete package
  deletePackage: {
    type: DeletePackageOutputType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) }
    },
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
        const deletedPackage = await Package.findOneAndDelete({
          clientID: currentClient._id,
          _id: args.id
        })
        if (!deletedPackage)
          throw new Error('Error deleting package from database')
        return { success: true, message: 'Package deleted successfully' }
      } catch (error) {
        throw new Error('Error deleting package: ' + error.message)
      }
    }
  },

  // Delete all packages of a client
  deletePackages: {
    type: DeletePackagesOutputType,
    resolve: async (parent, args, context) => {
      // Check if client is logged in
      const currentClient = isLoggedIn(context.headers.authorization)
      try {
        const deletedPackages = await Package.deleteMany({
          clientID: currentClient._id
        }).exec()
        if (!deletedPackages)
          throw new Error('Error deleting packages from database')
        return { success: true, message: 'Packages deleted successfully' }
      } catch (error) {
        throw new Error('Error deleting packages: ' + error.message)
      }
    }
  }
}

module.exports = {
  packageMutations
}
