const Package = require('../../models/package') // Mongoose Model
const Client = require('../../models/client') // Mongoose Model
const {
  LoginInputType,
  LoginOutputType,
  RegisterOutputType,
  RegisterInputType,
  UpdateClientOutputType,
  UpdateClientInputType,
  DeleteClientOutputType,
  DeleteAllClientsOutputType,
  LogoutOutputType
} = require('../types/client-types') // GraphQL Type
const { GraphQLNonNull } = require('graphql') // GraphQL library
const bcrypt = require('bcrypt')
const { createToken, isLoggedIn } = require('../helpers/verifications-token') // Helper function to verify token

// Client Mutations
const clientMutations = {
  // Add Client
  addClient: {
    type: RegisterOutputType,
    args: {
      input: { type: new GraphQLNonNull(RegisterInputType) }
    },
    resolve: async (parent, { input: { name, email, password } }, context) => {
      try {
        // Check if a client is already logged in
        if (context.token)
          throw new Error('A user is already logged in, please log out first')
        // Validate email and password and check if client already exists
        const emailRegex = /^\S+@\S+\.\S+$/
        if (!emailRegex.test(email))
          throw new Error(
            'Please enter a valid email address : example@example.com'
          )

        const existingClient = await Client.findOne({ email }).exec()
        if (existingClient)
          throw new Error('This email address is already in use')

        const passwordRegex =
          /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/

        if (!passwordRegex.test(password))
          throw new Error(
            'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character (!@#$%^&*)'
          )

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)
        password = hashedPassword
        // Check if password was hashed
        if (!hashedPassword) throw new Error('Password could not be hashed')
        // Create new client
        const client = new Client({
          name,
          email,
          password
        })

        // Save client
        const newClient = await client.save()
        if (!newClient) throw new Error('Failed to save client to the database')

        // Create token
        const token = createToken(newClient._id)
        context.token = token
        return { success: true, message: 'Register Succesful', token: token }
      } catch (error) {
        throw new Error('Register Failed: ' + error.message)
      }
    }
  },

  // Update Client
  updateClient: {
    type: UpdateClientOutputType,
    args: {
      input: { type: UpdateClientInputType }
    },
    resolve: async (parent, args, context) => {
      // Check if client is logged in
      const currentClient = isLoggedIn(context.token)
      try {
        // Check if there is anything to update
        if (!args.input || Object.keys(args.input).length === 0)
          return { success: true, message: 'Anything to update' }

        // Hash password if it exists
        if (args.input.password) {
          const passwordRegex =
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/

          if (!passwordRegex.test(password))
            throw new Error(
              'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character (!@#$%^&*)'
            )
          const hashedPassword = await bcrypt.hash(args.input.password, 10)
          if (!hashedPassword) throw new Error('Password could not be hashed')
          args.input.password = hashedPassword
        }

        // Update client
        const updatedClient = await Client.findByIdAndUpdate(
          currentClient._id,
          {
            name: args.input.name,
            email: args.input.email,
            password: args.input.password
          },
          { new: true }
        )
        if (!updatedClient)
          throw new Error('Failed to update client in the database')
        return { success: true, message: 'CLient updated succesful' }
      } catch (error) {
        throw new Error('Update Failed: ' + error.message)
      }
    }
  },

  // Delete Client
  deleteClient: {
    type: DeleteClientOutputType,
    resolve: async (parent, args, context) => {
      // Check if client is logged in
      const currentClient = isLoggedIn(context.token)
      try {
        const deletedPackages = await Package.find({
          clientID: currentClient._id
        })
          .deleteMany()
          .exec() // Delete all projects associated with client
        if (!deletedPackages)
          throw new Error('Failed to delete packages related to client')
        const deletedClient = await Client.findByIdAndDelete(currentClient._id) // Delete client
        if (!deletedClient) throw new Error('Failed to delete client')
        return { success: true, message: 'Client and packages related deleted' }
      } catch (error) {
        throw new Error('Delete Failed: ' + error.message)
      }
    }
  },

  // Login Client
  login: {
    type: LoginOutputType,
    args: {
      input: { type: new GraphQLNonNull(LoginInputType) }
    },
    resolve: async (parent, { input: { email, password } }, context) => {
      try {
        // Check if a client is already logged in
        if (context.token)
          throw new Error('A user is already logged in, please log out first')
        // Check if client exists
        const client = await Client.findOne({ email }).exec()
        if (!client) throw new Error('Client does not exist')

        // Check if password is correct
        const validPassword = await bcrypt.compare(password, client.password)
        if (!validPassword) throw new Error('Password is incorrect')

        // Create and assign token
        const token = createToken(client._id)
        context.token = token
        return { success: true, message: 'Login Succesful', token: token }
      } catch (error) {
        throw new Error('Login Failed: ' + error.message)
      }
    }
  },

  logout: {
    type: LogoutOutputType,
    resolve: async (parent, args, context) => {
      try {
        // Verify user is authenticated
        if (!context.token) throw new Error('User is not logged in')
        // Clear token
        context.token = ''
        return { success: true, message: 'Logout Succesful' }
      } catch (error) {
        throw new Error('Logout Failed: ' + error.message)
      }
    }
  },

  // Delete All Clients (for testing purposes)
  deleteAllClients: {
    type: DeleteAllClientsOutputType,
    resolve: async () => {
      try {
        const deletedPackages = await Package.deleteMany().exec() // Delete all projects
        if (!deletedPackages) throw new Error('Failed to delete all packages')
        const deletedClients = await Client.deleteMany().exec() // Delete all clients
        if (!deletedClients) throw new Error('Failed to delete all clients')
        return {
          success: true,
          message: 'All clients and packages related deleted'
        }
      } catch (error) {
        throw new Error('Delete Failed: ' + error.message)
      }
    }
  }
}

module.exports = {
  clientMutations
}
