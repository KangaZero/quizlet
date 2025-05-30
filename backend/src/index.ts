import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();

// REST endpoint example
app.get('/api/hello', async (req, res) => {
  res.json({ message: 'Hello from REST!' });
});

// GraphQL type definitions and resolvers (minimal example)
const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;
const resolvers = {
  Query: {
    hello: () => 'Hello from GraphQL!',
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
async function startApollo() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });
}
startApollo();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`GraphQL endpoint at http://localhost:${PORT}/graphql`);
});
