require('dotenv').config();

const express = require('express');
const { buildSchema } = require('graphql');
const { graphqlHTTP } = require('express-graphql');

const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Post = require('./models/Post');
require('./mongoconnect');

const jwtSecret = process.env.JWT_SECRET;

/**
 * -  Download project
 * - npm i
 * - npm run debug
 *
 * Required:
 *  - implement User type
 *  - rewrite Mutations
 *  - rewrite Login function
 *  - Delete Post by Id (Authenticated) Bonus(user owner only can delete post)
 *  - Patch Post content by Id (Authenticated) Bonus(user owner only can patch post)
 *  - Get All posts (Array of posts, and each post include user)
 *  - Get Posts of specific user (by userId) (Authenticated)
 */

const schema = buildSchema(`
  type User {

  }
  type RegistrationResult{
    id:ID
    username: String
    error: String
  }
  type LoginResult{
    token: String
    error: String
  }
 
  input UserRegisterInput{
    username: String!
    age: Int
    firstName: String
    lastName: String
    password: String!
  }

  input UserLoginInput{
    username: String!
    password: String!
  }

  type Post{
    id: ID
    content: String
    user: User
    error: String
  }
  type Query {
    ping: String
    getPost(id: ID!, token:String!): Post
  }
  type Mutation {
    createUser(input: UserRegisterInput!): RegistrationResult
  }
`);


const verifyToken = (token) => {
  try {
    const { userId } = jwt.verify(token, jwtSecret);
    return User.findById(userId);
  } catch (error) {
    return null;
  }
};


const withAuthentication = fn => async ({ token, ...params }) => {
  const user = await verifyToken(token);
  if (!user) return ({ error: 'Authentication error' });
  return fn({ ...params, user });
};

const createPost = async ({ content, user }) => {
  const post = new Post({ content, userId: user.id });
  await post.save();
  return { ...post, id: post.id, user };
};
const getPost = async ({ id }) => {
  const post = await Post.findById(id).populate('userId');
  return { ...post.toJSON(), user: post.userId };
};

const usersMutations = {
  async createUser({ input }) {
    try {
      const user = new User(input);
      await user.save();
      return user;
    } catch (error) {
      return ({ error: error.message });
    }
  },
  async loginUser({ input: { username, password } }) {

  },
  createPost: withAuthentication(createPost),
  getPost: withAuthentication(getPost),
};


const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: {
    ...usersMutations,

  },
  graphiql: true,
}));

app.listen(5000, () => {
  console.log('Server is runing');
});

