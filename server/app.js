const express = require('express') // Express library
const cors = require('cors') // CORS library
const colors = require('colors') // Console colors
require('dotenv').config() // Environment variables
const schema = require('./graphQL/schema/schema') // GraphQL Schema
const { graphqlHTTP } = require('express-graphql') // GraphQL library
const { connectDB, mongoose } = require('./config/db') // MongoDB connection
const port = process.env.PORT || 5000 // Port

const app = express() // Initialize Express
// Enable CORS
app.use(
  cors({
    origin: 'http://localhost:5000'
  })
)
// Connect to database
connectDB()

// Middleware for GraphQL
app.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: process.env.NODE_ENV === 'development', // Enable GraphiQL in development,
    context: { token: '' }
  })
)

const server = app.listen(port, console.log(`Server running on port ${port}`)) // Start server

// Close server and database connection on SIGINT
process.on('SIGINT', () => {
  console.log('\nClosing server...')
  server.close(() => {
    console.log('Server closed')
    mongoose.connection.close().then(() => {
      console.log('MongoDB connection closed')
      process.exit(0)
    })
  })
})
