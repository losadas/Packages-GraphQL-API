const Package = require('../../models/package') // Mongoose Model
const Client = require('../../models/client') // Mongoose Model
const {
  ClientType,
  LoginInputType,
  AddClientType,
  LoginOutputType
} = require('../types/client-types') // GraphQL Type
const { GraphQLString, GraphQLNonNull, GraphQLBoolean } = require('graphql') // GraphQL library
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
    type: AddClientType,
    args: {
      name: { type: GraphQLNonNull(GraphQLString) },
      email: { type: GraphQLNonNull(GraphQLString) },
      password: { type: GraphQLNonNull(GraphQLString) }
    },
    resolve: async (parent, args) => {
      // Check if client already exists
      const emailRegex = /^\S+@\S+\.\S+$/
      if (!emailRegex.test(args.email)) {
        throw new Error('Invalid email format')
      }
      if (args.password.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }
      const existingUser = await Client.findOne({ email: args.email })
      if (existingUser) {
        throw new Error('A user already exists with this email')
      }
      // Hash password
      const hashedPassword = await bcrypt.hash(args.password, 10)
      const client = new Client({
        name: args.name,
        email: args.email,
        password: hashedPassword
      })
      const savedClient = await client.save() // Save client to database
      return savedClient
    }
  },

  // Update Client
  updateClient: {
    type: ClientType,
    args: {
      name: { type: GraphQLString },
      email: { type: GraphQLString },
      password: { type: GraphQLString }
    },
    resolve: async (parent, args, context) => {
      // Check if client is logged in
      const isLogged = isLoggedIn(context.token)
      // Hash password if it exists
      if (args.password) {
        const hashedPassword = await bcrypt.hash(args.password, 10)
        args.password = hashedPassword
      }
      // Update client
      const updatedClient = await Client.findByIdAndUpdate(
        isLogged._id,
        {
          name: args.name,
          email: args.email,
          password: args.password
        },
        { new: true }
      )
      return updatedClient
    }
  },

  // Delete Client
  deleteClient: {
    type: ClientType,
    resolve(parent, args, context) {
      // Check if client is logged in
      const isLogged = isLoggedIn(context.token)
      Package.find({ clientID: isLogged._id }).deleteMany().exec() // Delete all projects associated with client
      return Client.findByIdAndDelete(isLogged._id) // Delete client
    }
  },

  // Delete All Clients (for testing purposes)
  deleteAllClients: {
    type: GraphQLBoolean,
    resolve(parent, args) {
      Package.deleteMany().exec() // Delete all projects
      Client.deleteMany().exec() // Delete all clients
      return true
    }
  },

  // Login Client
  login: {
    type: LoginOutputType,
    args: {
      input: { type: new GraphQLNonNull(LoginInputType) }
    },
    resolve: async (parent, args, context) => {
      // Check if client exists
      const client = await Client.findOne({ email: args.input.email })
      if (!client) {
        return { success: false, message: 'Client not found' }
      }
      // Check if password is correct
      const validPassword = await bcrypt.compare(
        args.input.password,
        client.password
      )
      if (!validPassword) {
        return { success: false, message: 'Invalid password' }
      }
      // Check if client is already logged in
      const currentClient = verifyToken(context.token)
      if (currentClient) {
        if (currentClient._id === client._id.toString()) {
          return { success: false, message: 'Client already logged in' }
        }
      }
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
      if (!context.token) {
        throw new Error('User is not authenticated')
      }
      // Clear token
      context.token = ''
      return true
    }
  }
}

module.exports = {
  clientMutations
}
