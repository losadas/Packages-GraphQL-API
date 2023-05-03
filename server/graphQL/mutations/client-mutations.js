const Package = require('../../models/package') // Mongoose Model
const Client = require('../../models/client') // Mongoose Model
const { ClientType } = require('../types/client-type') // GraphQL Type
const {
  GraphQLString,
  GraphQLID,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLInputObjectType
} = require('graphql') // GraphQL library
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
    return decoded
  } catch (err) {
    return null
  }
}

const LoginInputType = new GraphQLInputObjectType({
  name: 'LoginInput',
  fields: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) }
  }
})

// Client Mutations
const clientMutations = {
  // Add Client
  addClient: {
    type: new GraphQLObjectType({
      name: 'AddClient',
      fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        email: { type: GraphQLString }
      })
    }),
    args: {
      name: { type: GraphQLNonNull(GraphQLString) },
      email: { type: GraphQLNonNull(GraphQLString) },
      password: { type: GraphQLNonNull(GraphQLString) }
    },
    resolve: async (parent, args) => {
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
      const isloggedIn = verifyToken(context.token)
      if (!isloggedIn) {
        throw new Error('Unauthorized')
      }
      if(args.password) {
        const hashedPassword = await bcrypt.hash(args.password, 10)
        args.password = hashedPassword
      }
      
      const updatedClient = await Client.findByIdAndUpdate(
        isloggedIn._id,
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
      const isloggedIn = verifyToken(context.token)
      if (!isloggedIn) {
        throw new Error('Unauthorized')
      }
      Package.find({ clientID: isloggedIn._id }).deleteMany().exec() // Delete all projects associated with client
      return Client.findByIdAndDelete(isloggedIn._id) // Delete client
    }
  },

  // Login Client
  login: {
    type: new GraphQLObjectType({
      name: 'Login',
      fields: () => ({
        success: { type: GraphQLBoolean },
        message: { type: GraphQLString },
        token: { type: GraphQLString }
      })
    }),
    args: {
      input: { type: new GraphQLNonNull(LoginInputType) }
    },
    resolve: async (parent, args, context) => {
      const client = await Client.findOne({ email: args.input.email })
      if (!client) {
        return { success: false, message: 'Client not found' }
      }
      const validPassword = await bcrypt.compare(
        args.input.password,
        client.password
      )
      if (!validPassword) {
        return { success: false, message: 'Invalid password' }
      }
      const token = jwt.sign({ _id: client._id }, process.env.TOKEN_SECRET)
      context.token = token
      return { success: true, message: 'Login Succesful', token: token }
    }
  },

  logout: {
    type: GraphQLBoolean,
    resolve: async (parent, args, context) => {
      // Verificar si el usuario está autenticado
      if (!context.token) {
        throw new Error('User is not authenticated')
      }
      // Eliminar la sesión actual
      context.token = ''
      return true
    }
  }
}

module.exports = {
  clientMutations
}
