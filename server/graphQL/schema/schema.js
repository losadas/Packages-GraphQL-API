const { clientQueries } = require('../queries/client-queries') // GraphQL Client Queries
const { packageQueries } = require('../queries/package-queries') // GraphQL Project Queries
const { clientMutations } = require('../mutations/client-mutations') // GraphQL Client Mutations
const { packageMutations } = require('../mutations/package-mutations') // GraphQL Project Mutations
const { GraphQLObjectType, GraphQLSchema } = require('graphql') // GraphQL library

// Queries
const query = new GraphQLObjectType({
  name: 'Queries',
  fields: { ...clientQueries, ...packageQueries }
})

// Mutations
const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: { ...clientMutations, ...packageMutations }
})

// Export Schema
module.exports = new GraphQLSchema({
  query,
  mutation
})
