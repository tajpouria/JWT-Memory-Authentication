# JWT Memory Authentication

## setup apollo-server-express

### installing dependencies

> yarn add graphql apollo-server-express express
> yarn add @types/graphql @types/express

### setup ApolloServer

```typescript
(() => {
  const app = express();

  const apolloServer = new ApolloServer({
    context: ({ req, res }) => ({ req, res }),
    typeDefs,
    resolvers
  });
  apolloServer.applyMiddleware({ app });

  createConnection();

  app.listen(4000, () => console.info(`Listening on port 4000`));
})();
```

### access token and refresh token

access token uses to ensure the user has access to appropriate resources and typically have a limited lifetime. when the access token being expire or become invalid
but the application still needs to access a protected resources; to solve this problem, OAuth 2.0 introduced an artifact called a refresh token the a refresh token
allows an application to obtain new access token without prompting the user.

**to receive refresh token as cookie at grapqil make sure set _"request.credentials": "include"_ at setting tab**

### revoke refresh token

there is a several ways to revoke user refresh token but in this case we follow refreshTokenVersion instruction:

./entity/User.ts

```typescript
@Entity("User")
export class User extends BaseEntity {
  @Column("int", { default: 0 })
  refreshTokenVersion: number;
}
```

./resolvers.ts

```typescript
export const resolvers = {
    revokeRefreshTokenForUser: async (_parent,{userId}) => {
        await getConnection()
            .getRepository(User)
            .increment({ id: userId }, "refreshTokenVersion", 1);
        return;
    }

    login: async (email, password) => {
        // ...

        res.cookie('jid', {userId: user.id, refreshTokenVersion: user.refreshTokenVersion})
    }

    refreshToken :(_parent, _args, {req}) => {
        const refreshToken = req.cookies.jid
        const payload = verify(refreshToken, 'secret')
        if(payload.refreshTokenVersion !== user.refreshTokenVersion){
            return 'refresh token is invoked your should provide new one'
        }
    }
};
```

```typescript
import { sign } from "jsonwebToken";
export const resolvers = {
  resolvers: {
    login: async (_parent: any, { email, password }: any, { res }) => {
      const user = await User.findOne({ where: { email } });

      // set refresh token in cookie

      res.cookie(
        "jit",
        sign({ userId: user.id }, "RTSecret", { expiresIn: "7d" }),
        {
          httpOnly: true, // javascript can access the cookie
          path: "/refresh_token" // cookie is available on req.headers that specifie to this endpoint this is best practice not to send cookie for every req
        }
      );

      // to clear the actual cookie you can use  res.clearCookie('jid')

      // return access Token
      return sign({ userId: user.id }, "ATSecret", { expiresIn: "15m" });
    }
  }
};
```

### using middleware(combine reducers) in apollo-server express

> yarn add graphql-resolvers
> yarn add -D @types/graphql-resolvers

```typescript
import { skip, combineResolvers } from "graphql-resolvers";

const logger = (parent, args, context) => {
  console.log(context);
  skip;
};

export const resolvers = {
  hi: combineResolvers(logger, () => "hi")
};
```

### update context based on req.headers

```typescript
import { verify } from "jsonwebtoken";

const isLoggedIn = (parent, args, context) => {
  const token = context.req.headers.Authorization.split(
    " "
  )[1]; /* cuz we send {"Authorization": "bearer eyJhbGciOiJIUzI1NiIs"} */

  const payload = verify(token, "secret");

  context.payload = { userId: payload.userId };
};
```

### cookieParser

> yarn add -D cookieParser
> yarn add cookieParser

by default cookie is available on req.headers using **app.use(cookieParser())** allow to access parsed cookie at **req.cookies**.

## graphql client

### install dependencies

> yarn add apollo-boost @apollo/react-hooks graphql
> yarn add -D @types/graphql

### setup client and @apollo/react-hooks

```typescript
import ApolloServer from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";

const client = new ApolloServer({ uri: "http://localhost:4000/grqphql" });
<ApolloProvider client={client}>
  <App />
</ApolloProvider>;
```

### @graphql-codegen/cli

> yarn add -D @graphql-codegen/cli
> npx graphql-codegen init

setup to using hooks

```yml
overwrite: true
schema: "http://localhost:4000/graphql"
documents: "src/graphql/*.graphql"
generates:
  src/generated/graphql.tsx:
    plugins:
      - "typescript"
      - "typescript-operations"
      - "typescript-react-apollo"
    config:
      withHOC: false
      withComponent: false
      withHooks: true
```

place queries at ./graphql/\*.graphql

e.g.

```graphql
query Users {
  users {
    id
    email
    refreshTokenVersion
  }
}
```

run following command to generate hooks

> yarn run gen

### CORS POLICY

in cases receive **CORS POLICY** error for set cookie and etc... in graphql client implement following steps:

1. set **{ credential: "include" }** at **client** options:

./index.ts

```typescript
import ApolloClient from "apollo-boost";

const client = new ApolloClient({
  uri: "http://localhost:4000/graphql",
  credentials: "include" // ***
});
```

2. install **cors** package at **server**:

   > yarn add cors
   > yarn add -D @types/cors

3. setup cors middleware at the very bigging of your middleWares and set following options:

```typescript
import cors from "cors";

app.use(
  cors({
    credential: true,
    origin: "http://localhost:3000" // set origin on what defined in CORS POLICY as error (the actual origin you going to sen request)
  })
);
```

4. set **{ cors : false }** at graphql **applyMiddleware**

```typescript
import { ApolloServer } from "apollo-server-express";

const apolloServer = new ApolloServer({ typeDefs, resolvers });

apolloServer.applyMiddleware({
  app,
  cors: false // ***
});
```

5. restart the processes

### modify request on client

```typescript
const client = new ApolloClient({
  uri: "http://localhost:4000",
  credential: true,
  request: operation => {
    operation.setContext({
      headers: { Authorization: "bearer accessToken" } // .e.g. setup req.headers.authorization
    });
  }
});
```

### jwt-decode

> yarn add jwt-decode
> yarn add -D @types/jwt-decode

```typescript
import JwtDecode from "jwt-decode";

const token = djskladjl2kj3; //jwt token

const decodedJwt = JwtDecode(token);

console.log(decodeJwt);

/*
 * { foo: "bar,
 *   exp: 1393286893, // when jwt expired in milliSecond
 *   iat: 1393268893  }
 */
```

### handle the case access token is expired

- first if you using _apollo_boost_ needs to migrate from it to access to be able to define a custom link:
  [https://www.apollographql.com/docs/react/migrating/boost-migration/#advance-migration]

- install apollo-link-token-refresh

> yarn add apollo-link-token-refresh

- setup when fetch for refresh_token and how to set it:

```typescript
import { TokenRefreshLink } from "apollo-link-token-refresh";

const client = new ApolloClient({
  link: ApolloLink.from([
    new TokenRefreshLink({
      accessTokenField: "accessToken", // the actual name of access token field the come from response if return false means invalid it's go ahead and fetch for accessToken
      isTokenValidOrUndefined: () => {
        const token = getAccessToken();

        if (!token) {
          return true;
        }

        try {
          const { exp } = JwtDecode(token);

          if (Date.now() >= exp * 1000) {
            //Data.now : 1569622923241  is in milliSecond format
            return false;
          } else {
            return true;
          }
        } catch {
          return false;
        }
      },
      fetchAccessToken: () => {
        // how to fetch access refresh token
        return fetch("http://localhost:4000/refresh_token", {
          method: "POST",
          credentials: "include"
        });
      },
      handleFetch: accessToken => {
        // what to do with fetched access token
        setAccessToken(accessToken);
      },
      handleError: err => {
        console.warn("Your refresh token is invalid. Try to relogin");
        console.error(err);
      }
    }),

    // extra link stuffs
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        console.error(graphQLErrors);
      }
      if (networkError) {
        console.error(networkError);
      }
    }),
    requestLink,
    new HttpLink({
      uri: "http://localhost:4000/graphql",
      credentials: "include"
    })
  ]),
  cache
});
```

###

the apollo cache after Mutation

```typescript
const [login] = userLoginMutation();

login({
  args: { email, password },

  update: (store, { data }) => {
    // update function is triggered whenever the mutation completed
    if (!data || !data.user) return null;

    store.writeQuery<MeQuery>({
      query: UserDocument,
      data: {
        __typeName = "Query", //optional
        me: data.user
      }
    });
  }
});
```

### logout the user on the client

```typescript
const [logout, { client }] = useLogoutMutation(); // here you accessing apolloClient

const handleLogout = async () => {
  await logout();

  // it is always best practice to reset apollo cache after user logout

  client!.resetStore();
};

<button onClick={handleLogout}> Logout </button>;
```

## Type ORM

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

```typescript
Entity();
export class Author extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => AuthorBook, ab => ab.author)
  bookConnection: Author;
}

Entity();
export class Book extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => AuthorBook, ab => ab.Book)
  authorConnection: Book;
}

Entity();
export class AuthorBook extends BaseEntity {
  @PrimaryColumn()
  authorId: number;

  @PrimaryColumn()
  bookId: number;

  @ManyToOne(() => Author, author => author.bookConnection, { primary: true })
  @JoinColumn({ name: "bookId" })
  author: Author;

  @ManyToOne(() => Book, book => book.authorConnection, { primary: true })
  @JoinColumn({ name: "bookid" })
  book: Book;
}
```

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
    const response = await this.get("launches", {
      flight_number: launchId
    }); // https://api.spacexdata.com/v2/launches?flight_number=launchId
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
  context: async ({ req, res }) => {
    /* to access the res.cookie you can also return res from here return ({req, res}) */

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
mutation when it is called.The second value is result object that containing **{data, loading, error}**

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

## Interesting Stuff

### preferred tsconfig

> npx tsconfig.json

### upgrade packages

> yarn upgrade-interactive --latest

### postgres

DROP DATABASE already accessing by other users:

> sudo /etc/init.d/postgresql stop
> sudo /etc/init.d/postgresql start

### dotenv

> yarn add dotenv

```typescript
import "dotenv/config";
// release environment variables at .env file at the actual environment
```

### Axios explained

#### axiosResponse

```json
{
  "status": 200,
  "headers": {
    "x-total-count": "200",
    "pragma": "no-cache",
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=14400",
    "expires": "Mon, 28 Oct 2019 14:09:52 GMT"
  },
  "data": [
    {
      "userId": 1,
      "id": 1,
      "title": "delectus aut autem",
      "completed": false
    },
    {
      "userId": 1,
      "id": 2,
      "title": "quis ut nam facilis et officia qui",
      "completed": false
    },
    {
      "userId": 1,
      "id": 3,
      "title": "fugiat veniam minus",
      "completed": false
    },
    {
      "userId": 1,
      "id": 4,
      "title": "et porro tempora",
      "completed": true
    },
    {
      "userId": 1,
      "id": 5,
      "title": "laboriosam mollitia et enim quasi adipisci quia provident illum",
      "completed": false
    }
  ],
  "config": {
    "url": "https://jsonplaceholder.typicode.com/todos",
    "params": {
      "_limit": 5
    },
    "headers": {
      "Accept": "application/json, text/plain, */*"
    },
    "transformRequest": [null],
    "transformResponse": [null],
    "timeout": 0,
    "xsrfCookieName": "XSRF-TOKEN",
    "xsrfHeaderName": "X-XSRF-TOKEN",
    "maxContentLength": -1,
    "method": "get"
  }
}
```

#### params and timeout

```typescript
axios("http", {
  params: { _limit: 5 },
  timeout: 5000 // if not resolved after 5000 ms throw an Error
});
```

#### axios.all and axios.spread

```typescript
axios.all([axios("http"), axios.delete("https")]).then(
  // axios.spread(***() => {})
  axios.spread((getResponse, deleteResponse) => {
    console.log(getResponse, deleteResponse);
  })
);
```

#### axios.interceptor

```typescript
// on every request
axios.interceptor.request.use(
  config => {
    console.info(
      `${config.method!.toUpperCase()} request sent to ${
        config!.url
      } at ${new Date().getTime()} `
    );
    return config; // ***
  },
  //***
  err => Promise.reject(err)
);

// on every response
axios.interceptor.response.use(res => res, err => promise.reject(res));
```

#### custom headers

```typescript
axios("http", {
  headers: { "content-type": "application/json", authorization: "token" }
})``;
```

#### transformResponse or transformRequest

```typescript
axios.post('http',{title: 'uppercase me at response'}, {transformResponse: axios.defaults.transformResponse.concat (data) => {
    data.tile  = data.toUpperCase()
    return data
}})
// typescript strict implementation is available at ./axiosExplained/script.ts
```

#### axios globals

```typescript
axios.defaults.headers.common["x-auth-token"] = "token";
```

#### error handling

```typescript
axios
  .get("https://jsonplaceholder.typicode.com/todoss", {
    validateStatus: status => {
      // reject just if status is less or equal to 500
      return status > 500;
    }
  })
  .catch(err => {
    if (err.response) {
      // Server responded with a status other than 200 range
      console.log(err.response);
    }
    // Request was made but no response
    console.log(err.request);
    console.log(err.message);
  });
```

#### axios.CancelToken

```typescript
axios.getElementById("cancel").addEventHandler(() => {
  const source = axios.CancelToken.source();

  axios
    .get("http", {
      cancelToken: source.token
    })
    .then(res => res)
    .catch(err => {
      if (axios.isCancel(err)) {
        console.log("Request was canceled!", err.message);
      }
    });

  if (true) {
    source.cancel("request canceled!");
  }
});
```

#### axios instance

```typescript
const axiosInstance = axios.create({
  // custom settings
  baseURL: "https://jsonplaceholder.typicode.com"
});

const res = await axiosInstance("/comments", { params: { _limit: 5 } });
```

# React SandBox

### shallow comparison

```javascript
const a = [1, 2, 3];
const b = [1, 2, 3];
const c = a;

// false cuz they not referencing to the same place at the memory
a === b;

a === c; // true

// same in objects
```

### React.pureComponent

terminology:

- We can create a pureComponent by extending the PureComponent on React
- **A PureComponent implements the _shouldComponentUpdate_ method by performing a _shallow comparison_ on the _props_ and _state_ of the component**
- if there is not difference, the component will not re-render - performing boost.

caveats:

- it is best practice to ensure that all the children components are also pure component to avoid unexpected behavior.
- never **mutate** the state, Always return a **new object** that reflects the state.

```javascript
class Regular extends Component {
  render() {
    console.log("REGULAR");
    return <p>{this.props.children}</p>;
  }
}

class Regular extends PureComponent {
  render() {
    console.log("PURE");
    return <p>{this.props.children}</p>;
  }
}

class App extends Component {
  state = { name: "Geo" };

  render() {
    console.log("APP");
    const { name } = this.state;
    return (
      <div className="App">
        <button onClick={this.handleClick}>addRandom</button>
        <Regular>{name}</Regular>
        <Pure>{name}</Pure>
      </div>
    );
  }

  handleClick = () => {
    this.setState(st => ({ name: "Geo" }));
  };
}
```

In mentioned example cuz shallow rendering happened on _PureComponent_ we receive following result on each re-render:

````shell
APP
REGULAR
PURE # pure just render once
APP
REGULAR
APP
REGULAR
APP
REGULAR
APP
REGULAR
.
.
.
​```
````

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

- why we people care about hooks??! cuz they can write it's custom hooks

```javascript
// ./src/hooks/useForm.js

import { useState } from "react";

export const useForm = initialState => {
  const [values, setValues] = useState(initialState);

  const onChange = event =>
    setValues(currentValues => ({
      ...currentValues,
      [event.target.name]: [event.target.value]
    }));

  return [values, onChange];
};

// ./src/App.jsx

import { useForm } from "./hooks/useForm";

const [values, handleChange] = useForm({ email: "" });

return <input name="email" value={values.email} onChange={handleChange} />;
```

## useEffect

- clean up function

```javascript
useEffect(() => {
  console.log("componentWillMount");
  return () => {
    console.log("ComponentWillUnmount"); // returned function from useEffect called cleanup function and it will triggered when ever component unmounted
  };
}, []);

// gotcha
// if call it changing some value like email it will trigger cleanup function whenever the email just changed
const [email, setEmail] = useState("");

useEffect(() => {
  console.log("componentWillMount");
  return () => {
    console.log("ComponentWillUnmount");
  };
}, ["email"]);

<input onChange={e => setEmail(e.target.value)} />;
```

- some use cases example :

1. add and remove event listener

```javascript
useEffect(() => {
  const onMouseMove = e => console.log(e);

  window.addEventListener("mouseMove", onMouseMove);

  return () => {
    window.removeEventListener("mouseMove", onMouseMove);
  };
}, []);
```

- multiple useEffect

```javascript
useEffect(() => {
  console.log("mount1");
});
useEffect(() => {
  console.log("mount2");
});
// mount1
// mount2
```

- waiting for changes in a custom hook

  ./useFetch.js

```javascript
export const useFetch = url => {
  const [state, setState] = useState({ loading: true, data: null });

  useEffect(() => {
    setState({ loading: true, data: null });
    fetch(url)
      .then(res => res.text)
      .then(res => {
        setState({ loading: false, data: res });
      });
  }, [url]);

  return state;
};
```

- persist state

```javascript
const [count] = useState(0);
useEffect(() => {
  localStorage.setItem("count", JSON.stringify(count));
}, [count]);
```

### useRef

- most obvious use case
  is getting reference to some element to call different methods on or give value on it

```javascript
const inputRef = useRef()

    <input ref={inputRef} />
    <button onClick={() => inputRef.current.focus()}>Focus</button>
```

- to reference a value

```javascript
const renders = useRef(0);
const [state, setState] = useState(true);

<button onClick={() => setState(st => !st)}>hit</button>;
<p>Component renders : {renders.current++}</p>;
```

- avoiding setState after component unMounted

```javascript
const isCurrent = useRef(true);

function App() {
  useEffect(() => {
    // clean up function : called when the component is going to unMount
    return () => {
      isCurrent.current(false);
    };
  });

  const settingSomeState = () => {
    if (isCurrent) {
      // basically if component did not unMount do setState stuff
      setState({});
    }
  };
}
```

### useLayoutEffect

**useLayout** is helpful in case you want measure a box dimensions and ... after render occur, or any kind of work related to getting information about DOM.

react recommend starting with useEffect first and only trying useLayoutEffect if that causes a problem.

- getBoundingClientRect (get dimension of an element)

```javascript
const inputRef = UseRef()

useLayoutEffect(() => {
    console.log(inputRef.current.getBoundingClientRect())
}, [])

<input ref={inputRef}/>
```

### useCallBack

it good to prevent from creating a function on every single render,

- prevent reRender child component whenever using memo

```jsx
const Hello = React.memo((
    { increment } // *** React.memo check the is a kind of HOC and it will check the wrapped component props and if it changed it will reRender the component
) => <button onClick={() => increment(5)}>increment</button>);

const App = () => {
    useState[(count, setCount)] = useState(0);

    const increment = useCallback((n) => { // *** useCallback reCreate function whenever; dependencies changed
        setCount(c => c +n)
    }, [setCount])

    return (
        <div>
            <div>{count}</div>
            <Hello increment={increment}>
        </div>
    );
};
```

- fire useEffect just when the function change

```jsx
const App = () => {
  const increment = useCallback(() => {}, [setCount]);

  useEffect(() => {}, [increment]); // useEffect will trigger whenever increment function changed

  return <div onClick={increment} />;
};
```

### useMemo

Pass a “create” function and an array of dependencies. useMemo will only recompute the memoized value when one of the dependencies has changed

```jsx
// Without useMemo the function will reCalculate const on every render
const calculateSomeValue = depend => {
  // calculating some value
};

// With useMemo it will trigger calculating some just when dependency/dependencies changed

useMemo(
  depend => {
    // calculating some value
  },
  [depend]
);

const App = () => {
  return (
    <div>
      <button onClick={() => setSate(state + 12)}>Hello</button>
      <div>{calculateSomeValue(depend)}</div>
    </div>
  );
};
```

- example 2

```jsx
function App() {
  const data = useFetch("https://jsonplaceholder.typicode.com/todos");
  const [count, setCount] = useState(0);

  const calculateLongestWord = arr => {
    let longestWord = " ";
    console.log("calculating longest word");
    Array.isArray(arr) &&
      arr.forEach(todo =>
        todo.title.split(" ").forEach(word => {
          if (word.length > longestWord.length) longestWord = word;
        })
      );
    return longestWord;
  };

  const longestWord = useMemo(() => calculateLongestWord(data), [data]);

  return (
    <div className="App">
      <button onClick={() => setCount(count + 1)}>Calculate</button>
      <div>{longestWord}</div>
    </div>
  );
}
```

### userReducer

- basic of useReducer

```javascript
const types = { INCREMENT: "INCREMENT", DECREMENT: "DECREMENT" };

const reducer = (state, action) => {
  switch (action.type) {
    case types.INCREMENT:
      return state + 1;
    case types.DECREMENT:
      return state - 1;
    default:
      return state;
  }
};

function App() {
  const [count, dispatch] = userReducer(reducer, 0);

  return (
    <div className="App">
      <button
        onClick={() => {
          dispatch({ type: types.INCREMENT });
        }}
      >
        Increment
      </button>
      <button
        onClick={() => {
          dispatch({ type: types.DECREMENT });
        }}
      >
        Decrement
      </button>
      <h4>Count : {count}</h4>
    </div>
  );
}
```

### useContext

```jsx
import { createContext } from "react";
const UserContext = createContext(null);

export default async () => {
  return { id: 4, name: "bob", email: "bob@bob.com" };
};

function Home() {
  const { user, setUser } = useContext(UserContext);

  const handleLogin = useCallback(async () => {
    const user = await login();
    setUser(user);
  }, [setUser]);

  const handleLogout = useCallback(async () => {
    setUser(null);
  }, [setUser]);

  return (
    <div>
      Home
      <pre>{JSON.stringify(user, null, 2)}</pre>
      {!user ? (
        <button onClick={handleLogin}>login</button>
      ) : (
        <button onClick={handleLogout}>Logout</button>
      )}
    </div>
  );
}

function About() {
  const { user } = useContext(UserContext);
  return (
    <div>
      Home
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Switch>
        <UserContext.Provider value={{ user, setUser }}>
          <Route exact path="/" component={Home} />
          <Route path="/about" component={About} />
        </UserContext.Provider>
      </Switch>
    </Router>
  );
}
```
