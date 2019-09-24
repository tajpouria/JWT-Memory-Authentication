### Type ORM

provides great features that helps us to develop any kind of application that uses database.

### setup TypeOrm

> npm i -g typeorm

> typeorm init --name server --database postgres

ormconfig.json

```json
{
  "type": "postgres",
  "host": "localhost",
  "username": "postgres",
  "password": "postgres",
  "port": 5432,
  "database": "jwt-memory-auth",
  "synchronize": true,
  "logging": false,
  "entities": ["src/entity/**/*.ts"],
  "migrations": ["src/migration/**/*.ts"],
  "subscribers": ["src/subscriber/**/*.ts"],
  "cli": {
    "entitiesDir": "src/entity",
    "migrationsDir": "src/migration",
    "subscribersDir": "src/subscriber"
  }
}
```

> yarn start

### introduction to typorm

create Entity

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("tableName")
export class User {
  @PrimaryGeneratedColumn
  id: number;

  @Column({ type: "varchar", length: 50 })
  firstName: string;

  @Column({ type: "varchar", length: 50 })
  lastName: string;

  @Column({ type: "bool", default: false })
  confirmed: boolean;

  @Column("int")
  age: number;
}
```

create connection

```typescript
import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entity/User";

createConnection()
  .then(async connection => {
    const user = new User();
    user.firstName = "John";
    user.lastName = "Deo";
    user.age = 40;
    user.email = "hello@gmail.com";

    await connection.manager.save(user);

    const users = await connection.manager.find(User);
  })
  .catch(err => console.err(err));
```

CRUD in typeorm

```typescript
import { Entity, BaseEntity, Column } from "typeorm";

@Entity()
export class User extends BaseEntity {} // extending BaseEntity make available utility methods on User

@get("/")
  async getUsers(req: Request, res: Response) {
    const users = await User.find();
    res.send(users);
  }

  @get("/:id")
  async getUserById(req: Request, res: Response) {
    const user = await User.findByIds([req.params.id]);
    res.send(user);
  }

  @post("/")
  @bodyValidator(["firstName", "lastName", "email", "age"])
  async createUser(req: Request, res: Response) {
    await User.create(req.body).save();
    res.send(req.body);
  }

  @put("/:id")
  @bodyValidator([])
  async updateUser(req: Request, res: Response) {
    await User.update(req.params.id, req.body);
    // or await User.update({ firstName: req.body.firstName }, req.body);

    res.json({ success: true });
  }

  @_delete("/:id")
  async deleteUser(req: Request, res: Response) {
    const user = await User.findByIds([req.params.id]);
    await User.remove(user);
    res.json({ success: true });
  }
```

### one-to-one relations

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn
} from "typeorm";

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  favoriteColor: string;
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(type => Profile) // target table
  @JoinColumn() // must be set only on one side of relation the side that must have foreign key
  profile: Profile;
}
```

```sql
+-------------+--------------+----------------------------+
|                        user                             |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| profileId   | integer      |                            |
+-------------+--------------+----------------------------+

Foreign-key constraints:
    "FK_9466682df91534dd95e4dbaa616" FOREIGN KEY ("profileId") REFERENCES profile(id)

+-------------+--------------+----------------------------+
|                          profile                        |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
|favoriteColor| int(11)      | FOREIGN KEY                |
+-------------+--------------+----------------------------+
```

### create relations

```typescript
const profile = await Profile.create(raq.body.profile).save();
const user = await User.create({
  firstName: req.body.firstName,
  profile: profile
}).save();
```

### fetch relations

to fetch the relations you can simply specify it on as relations at options object

```typescript
const user = User.find({ relations: ["profile"] });
const user = User.findByIds(id, { relations: ["profile"] });
```

### Many-To-One and One-To-Many

```typescript
@Entity()
export class User extends BaseClass {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(type => User, photo => photo.user)
  photos: Photo[];
}

@Entity()
export class Photo extends BaseClass {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(type => User, user => user.photos)
  user: User;
}

// create relations
const photo1 = await Photo.create({ url: "photo1" }).save();
const photo2 = await Photo.create({ url: "photo2" }).save();

const user = await new User({ ...userInfo, photos: [photo1, photo2] }).save();
```

### Many-To-Many

## introduction to Apollo graphQL

## Introduction To Apollo Server

### install dependencies

Application that run apollo server needs require two top-level dependencies:

- apollo-server : is the core library to define the shape of data and how fetch it.
- graphql : the library used to build a graphql schema and run the queries.

### build a schema

./schema.js

```javascript
const { gql } = require("apollo-server");

const typeDefs = gql`
# Query type define what data we can fetch
type Query: {
  launches : [Launch]!
}
type Launch: {
  id: ID!
  name: String
  mission: Mission
}
type Mission: {
  missionPatch(size:PatchSize, description: DescriptionInput }):String
}
input DescriptionInput = {
  desc: String!
}
enum PatchSize {
  SMALL
  LARGE
}

# Mutation type is the entry point of into our graph in order to modifying data
type Mutation: {
  bookTrips: (launchIds: [ID]!): Boolean!
}

`;

module.exports = typeDefs;
```

### hook up data sources

### connect REST API to graph

> npm i apollo-datasource-rest

this package exposes **RESTDataSource** class that is responsible for fetching data from a REST API. to build a data source needs to extends the **RESTDataSource** and define **baseURL**

./datasources/launch.js

```javascript
const { RESTDataSource } = require("apollo-datasource-rest");

class LaunchAPI extends RESTDataSource {
  constructor() {
    this.baseURL = "https://api.spacexdata.com/v2/";
  }

  async getLaunchById(launchId) {
    const response = await this.get("launches", { flight_number: launchId }); // https://api.spacexdata.com/v2/launches?flight_number=launchId
  }
}

module.exports = LaunchAPI;
```

### write graph resolver

**Resolvers** provide the instruction for turning a graphql operation in data the can either return the same type of data specified in our schema or a promise of that data

how a resolver function looks like:

```javascript
fieldName: (parent, args, context, info) => data;

// parent: An object that contains the result returned from the resolver on the parent type
// args : An object that contains the arguments passed to field
// context: An object that shared by all resolvers in a graphQL operation we use context to contain per-request state such as authentication information and access our data sources.
// info : information about execution state of operation which should only user in advanced cases
```

./resolvers.js

```javascript
module.exports = {
  Query: {
    Launch: (_, { id }, { dataSources }) =>
      dataSources.launchAPI.getLaunchById(id)
  }
  Mission : {
    missionPatch : (mission, {size} = {size: "SMALL"}) =>{
    return size === 'SMALL'
      ? mission.missionPatchSmall
      : mission.missionPatchLarge;
  },

  Mutation: {
     bookTrips: async (_, { launchIds }, { dataSources }) => {
    const results = await dataSources.userAPI.bookTrips({ launchIds });
    const launches = await dataSources.launchAPI.getLaunchesByIds({
      launchIds,
    });

    return {
      success: results && results.length === launchIds.length,
      message:
        results.length === launchIds.length
          ? 'trips booked successfully'
          : `the following launches couldn't be booked: ${launchIds.filter(
              id => !results.includes(id),
            )}`,
      launches,
    };
  }
  }
};
```

### set up server

```javascript
const { ApolloServer } = require("apollo-server");
const { typeDefs } = require("./schema");
const resolvers = require("./resolvers");
const { LaunchAPI } = require("./datasources/launch.js");

const server = new ApolloServer({
  context: async ({ req }) => {
    const auth = req.headers && req.headers.authorization;
    return auth
      ? { authorization: req.headers.authorization }
      : { authorization: "not authorized" };
  },
  typDefs,
  resolver,
  dataSources: () => ({
    launchAPI: new LaunchAPI()
  })
});

server.listen().then(({ url }) => {
  console.log(`Server is Running on ${url}`);
});
```

## Hook Up Graph To Apollo Client

### install dependencies

- apollo-client : a complete data management solution with an intelligent cache

- react-apollo : the view layer integrated for React to export components such as **Query** and **Mutation**

- graphql-tag : the tag function **gql** to wrap our query strings in order to parse them into AST

- @apollo-react-hooks

- apollo-cache-inmemory

- apollo-link-http

### create ApolloClient

src/ index.js

```javascript
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";

const cache = new InMemoryCache();
const link = new HttpLink({
  uri: "http://localhost:4000",
  headers: {
    authorization: localStorage.getItem("token")
  }
});

const client = new ApolloClient({ cache, link });
```

### make your first query

```javascript
import gql from "graphql-tag";

client
  .query({
    query: gql`
      query getLaunch {
        Launch(id: 56) {
          id
          mission {
            name
          }
        }
      }
    `
  })
  .then(result => console.log(result));
/* 
  {data: {…}, loading: false, networkStatus: 7, stale: false} 
  */
```

## connect client to react

```javascript
import React from "react";
import ReactDOM from "react-dom";
import { ApolloProvider } from "@apollo/react-hooks";

import Pages from "./pages";

ReactDOM.render(
  <ApolloProvider client={client}>
    <Pages />
  </ApolloProvider>,
  document.getElementById("root")
);
```

### the userQuery hook

to create a component with useQuery, needs to import **useQuery** from **@apollo/react-hooks** and pass query wrapped with **gql** then wire wire up the component with **{data, loading, error}**
return from useQuery hook.

```javascript
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";

const GET_LAUNCH = gql`
  query GetLaunch($id: Int!) {
    launch(id: $id) {
      id
      mission {
        name
      }
    }
  }
`;

const { data, loading, error } = userQuery(GET_LAUNCH, {
  variables: { id: 1 },
  fetchPolicy : "network-only"
  /*
  by default Apollo Client's **fetchPolicy** is **cache-first** which mean it checks the
cache to see if the results is there before making network request if since we want always
reflect the newest data we set the **fetchPolicy** for this query **network-only**:
  */
  }
});
```

### using fragment to share code

when we have to graphql operation that contains the same fields, we can use a **fragment** to share code between the two.

```javascript
// defining a fragment
const LAUNCH_TILE_DATA = gql`
  fragment LaunchTile on Launch {
    id
    mission {
      name
    }
  }
`;

// using it
const GET_LAUNCH = gql`
  query GetLaunch($id: ID!) {
    launch(id: $id) {
      ...LaunchTile
    }
  }
  ${LAUNCH_TILE_DATA}
`;
```

### update data with mutations

The first value of **userMutation** tuple is the **mutate function** that triggers the
mutation when it is called.The second value is reslut object that containing **{data, loading, error}**

### useApolloClient

To access the **ApolloClient** instance we can use **useApolloClient** hooks.

```javascript
import { userMutation, useApolloClient } from "@apollo/react-hooks";

const LOGIN_USER = gql`
mutation LoginUser($email: String!){
  login(email: $email)
}
`

export default function {
  const client = useApolloClient()
  const [login, { loading, error }] = useMutation(LOGIN_USER, {
    onCompleted: ({ login }) => {
      localStorage.setItem("token", login);
      client.writeData({ data: { isLoggedIn: true } });
      // client.writeData can be used to write data to the Apollo cache this is
      // an example of directWrite
    }
  });
}
```

## React Hook Reminder

### useState

- avoid reset expensive initialState

```javascript
function expensiveInitialState() {
  return 10;
}
const [state, setState] = useState(() => expensiveInitialState()); // setup initialState by return it from a function will help to set it once and no reset that whenever component reRender
```

- avoid overriding update (two update at the same time)

```javascript
const [count, setCount] = useState(0);
return (
  <button onClick={() => setCount(currentCount => currentCount + 1)}>
    Increment
  </button>
);
```

## Interesting Stuff

### preferred tsconfig

> npx tscofig.json

### upgrade packages

> yarn upgrade-interactive --latest

### postgres

DROP DATABASE already accessing by other users:

> sudo /etc/init.d/postgresql stop
> sudo /etc/init.d/postgresql start
