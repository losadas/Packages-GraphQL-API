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
  DeleteAllClientsOutputType
} = require('../types/client-types') // GraphQL Type
const { GraphQLNonNull, GraphQLBoolean } = require('graphql') // GraphQL library
const bcrypt = require('bcrypt')
const {
  verifyToken,
  createToken,
  isLoggedIn
} = require('../helpers/verifications-token') // Helper function to verify token

// Client Mutations
const clientMutations = {
  // Add Client
  addClient: {
    type: RegisterOutputType,
    args: {
      input: { type: new GraphQLNonNull(RegisterInputType) }
    },
    resolve: async (parent, { input: { name, email, password } }, context) => {
      // Validate email and password and check if client already exists
      const emailRegex = /^\S+@\S+\.\S+$/
      if (!emailRegex.test(email))
        return { success: false, message: 'Invalid email' }

      const existingClient = await Client.findOne({ email })
      if (existingClient) {
        return {
          success: false,
          message: 'A client with this email already exists'
        }
      }

      if (password.length < 8)
        return {
          success: false,
          message: 'Password must be at least 8 characters'
        }

      // Check if client already exists

      // Hash password
      password = await bcrypt.hash(password, 10)
      const newClient = new Client({
        name,
        email,
        password
      })

      // Save client
      await newClient.save()

      // Create token
      const token = createToken(newClient._id)
      context.token = token
      return { success: true, message: 'Register Succesful', token: token }
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

      // Check if there is anything to update
      if (!args.input) return { success: true, message: 'Anything to update' }

      // Hash password if it exists
      if (args.input.password) {
        const hashedPassword = await bcrypt.hash(args.input.password, 10)
        args.input.password = hashedPassword
      }

      // Update client
      await Client.findByIdAndUpdate(
        currentClient._id,
        {
          name: args.input.name,
          email: args.input.email,
          password: args.input.password
        },
        { new: true }
      )
      return { success: true, message: 'Update Successful' }
    }
  },

  // Delete Client
  deleteClient: {
    type: DeleteClientOutputType,
    resolve: async (parent, args, context) => {
      // Check if client is logged in
      const currentClient = isLoggedIn(context.token)
      Package.find({ clientID: currentClient._id }).deleteMany().exec() // Delete all projects associated with client
      await Client.findByIdAndDelete(currentClient._id) // Delete client
      return { success: true, message: 'Client and packages related deleted' }
    }
  },

  // Delete All Clients (for testing purposes)
  deleteAllClients: {
    type: DeleteAllClientsOutputType,
    resolve(parent, args) {
      Package.deleteMany().exec() // Delete all projects
      Client.deleteMany().exec() // Delete all clients
      return {
        success: true,
        message: 'All clients and packages related deleted'
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
      // Check if client exists
      const client = await Client.findOne({ email })
      if (!client) return { success: false, message: 'Client not found' }

      // Check if password is correct
      const validPassword = await bcrypt.compare(password, client.password)
      if (!validPassword) return { success: false, message: 'Invalid password' }

      // Check if client is already logged in
      const currentClient = verifyToken(context.token)
      if (currentClient && currentClient._id === client._id.toString())
        return { success: false, message: 'Client already logged in' }

      // Create and assign token
      const token = createToken(client._id)
      context.token = token
      return { success: true, message: 'Login Succesful', token: token }
    }
  },

  logout: {
    type: GraphQLBoolean,
    resolve: async (parent, args, context) => {
      // Verify user is authenticated
      if (!context.token) throw new Error('User is not authenticated')
      // Clear token
      context.token = ''
      return true
    }
  }
}

module.exports = {
  clientMutations
}
