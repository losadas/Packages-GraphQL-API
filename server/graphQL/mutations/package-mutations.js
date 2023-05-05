const Package = require('../../models/package') // Mongoose Model
const {
  PackageType,
  PackageInputType,
  PackageUpdateInputType,
  UpdatePackageOutputType,
  DeletePackageOutputType,
  DeletePackagesOutputType,
  DeleteAllPackagesOutputType
} = require('../types/package-type') // GraphQL Type
const { GraphQLID, GraphQLNonNull } = require('graphql') // GraphQL library
const { isLoggedIn } = require('../helpers/verifications-token') // Auth library

// Project Mutations
const packageMutations = {
  // Add package
  addPackage: {
    type: PackageType,
    args: {
      input: { type: new GraphQLNonNull(PackageInputType) }
    },
    resolve: async (parent, args, context) => {
      const currentClient = isLoggedIn(context.token)
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
      input: { type: PackageUpdateInputType }
    },
    resolve: async (parent, args, context) => {
      // Check if client is logged in
      const currentClient = isLoggedIn(context.token)
      try {
        if (!args.input || Object.keys(args.input).length === 0)
          return { success: true, message: 'Anything to update' }
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
      id: { type: GraphQLNonNull(GraphQLID) }
    },
    resolve: async (parent, args, context) => {
      // Check if client is logged in
      const currentCLient = isLoggedIn(context.token)
      try {
        const deletedPackage = await Package.findOneAndDelete({
          clientID: currentCLient._id,
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
    args: {
      id: { type: GraphQLNonNull(GraphQLID) }
    },
    resolve: async (parent, args, context) => {
      // Check if client is logged in
      const currentCLient = isLoggedIn(context.token)
      try {
        const deletedPackages = await Package.deleteMany({
          clientID: currentCLient._id
        }).exec()
        if (!deletedPackages)
          throw new Error('Error deleting packages from database')
        return { success: true, message: 'Packages deleted successfully' }
      } catch (error) {
        throw new Error('Error deleting packages: ' + error.message)
      }
    }
  },

  // Delete all packages of all clients (for testing purposes)
  deleteAllPackages: {
    type: DeleteAllPackagesOutputType,
    resolve: async () => {
      try {
        const deletedPackages = await Package.deleteMany({}).exec()
        if (!deletedPackages)
          throw new Error('Error deleting all packages from database')
        return { success: true, message: 'All packages deleted successfully' }
      } catch (error) {
        throw new Error('Error deleting all packages: ' + error.message)
      }
    }
  }
}

module.exports = {
  packageMutations
}
