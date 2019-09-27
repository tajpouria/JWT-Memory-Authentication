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
                { httpOnly: true } // javascript cannot not access it anymore
            );

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

-   apollo-server : is the core library to define the shape of data and how fetch it.
-   graphql : the library used to build a graphql schema and run the queries.

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

-   apollo-client : a complete data management solution with an intelligent cache

-   react-apollo : the view layer integrated for React to export components such as **Query** and **Mutation**

-   graphql-tag : the tag function **gql** to wrap our query strings in order to parse them into AST

-   @apollo-react-hooks

-   apollo-cache-inmemory

-   apollo-link-http

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

-   avoid reset expensive initialState

```javascript
function expensiveInitialState() {
    return 10;
}
const [state, setState] = useState(() => expensiveInitialState()); // setup initialState by return it from a function will help to set it once and no reset that whenever component reRender
```

-   avoid overriding update (two update at the same time)

```javascript
const [count, setCount] = useState(0);
return (
    <button onClick={() => setCount(currentCount => currentCount + 1)}>
        Increment
    </button>
);
```

-   why we people care about hooks??! cuz they can write it's custom hooks

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

-   clean up function

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

-   some use cases example :

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

-   multiple useEffect

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

-   waiting for changes in a custom hook

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

-   persist state

```javascript
const [count] = useState(0);
useEffect(() => {
    localStorage.setItem("count", JSON.stringify(count));
}, [count]);
```

### useRef

-   most obvious use case
    is getting reference to some element to call different methods on or give value on it

```javascript
const inputRef = useRef()

    <input ref={inputRef} />
    <button onClick={() => inputRef.current.focus()}>Focus</button>
```

-   to reference a value

```javascript
const renders = useRef(0);
const [state, setState] = useState(true);

<button onClick={() => setState(st => !st)}>hit</button>;
<p>Component renders : {renders.current++}</p>;
```

-   avoiding setState after component unMounted

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

## Interesting Stuff

### preferred tsconfig

> npx tscofig.json

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
