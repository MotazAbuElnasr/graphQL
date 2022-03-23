const express = require('express');
const { buildSchema } = require('graphql');
const { graphqlHTTP } = require('express-graphql');
/*
scalar types
String
Int
Float
Boolean
ID

user defined types
*/
const schema = buildSchema(`
  type Query {
    helloWorlds: [String!]
  }  
`);
const resolvers = {
  helloWorlds() {
    return ['1', '2', null];
  },
  helloWorld2() {

  },
};

const app = express();

app.use('/graphql', graphqlHTTP({ schema, rootValue: resolvers, graphiql: true }));

app.listen(5000, () => {
  console.log('Server is runing');
});

