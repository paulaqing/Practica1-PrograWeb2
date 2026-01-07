const { buildSchema } = require('graphql');

const schema = buildSchema(`
  type User {
    id: ID!
    username: String!
    role: String!
    createdAt: String
  }

  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    createdAt: String
  }

  type OrderProduct {
    product: ID
    name: String!
    price: Float!
    quantity: Int!
  }

  type Order {
    id: ID!
    user: User!
    products: [OrderProduct!]!
    total: Float!
    status: String!
    createdAt: String
  }

  type Query {
    products: [Product!]!
    product(id: ID!): Product
    orders: [Order!]!
    order(id: ID!): Order
    myOrders: [Order!]!
    users: [User!]!
    user(id: ID!): User
  }

  type Mutation {
    createOrder(products: [OrderProductInput!]!): Order!
    updateOrderStatus(id: ID!, status: String!): Order!
    deleteUser(id: ID!): DeleteResponse!
    updateUserRole(id: ID!, role: String!): User!
  }

  input OrderProductInput {
    productId: ID!
    quantity: Int!
  }

  type DeleteResponse {
    success: Boolean!
    message: String
  }
`);

module.exports = schema;