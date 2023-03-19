---
id: sequelize
title: Sequelize
---

This is the Sequelize Adapter for [`next-auth`](https://authjs.dev).

## Getting Started

1. Install the necessary packages

```bash npm2yarn
npm install next-auth @next-auth/sequelize-adapter sequelize
```

:::warning
You'll also have to manually install [the driver for your database](https://sequelize.org/master/manual/getting-started.html) of choice.
:::

2. Add this adapter to your `pages/api/[...nextauth].js` next-auth configuration object.

```javascript title="pages/api/auth/[...nextauth].js"
import NextAuth from "next-auth"
import SequelizeAdapter from "@next-auth/sequelize-adapter"
import { Sequelize } from "sequelize"

// https://sequelize.org/master/manual/getting-started.html#connecting-to-a-database
const sequelize = new Sequelize("yourconnectionstring")

// For more information on each option (and a full list of options) go to
// https://authjs.dev/reference/configuration/auth-config
export default NextAuth({
  // https://authjs.dev/reference/providers/
  providers: [],
  adapter: SequelizeAdapter(sequelize),
})
```

## Updating the database schema

By default, the sequelize adapter will not create tables in your database. In production, best practice is to create the [required tables](https://authjs.dev/reference/adapters/models) in your database via [migrations](https://sequelize.org/master/manual/migrations.html). In development, you are able to call [`sequelize.sync()`](https://sequelize.org/master/manual/model-basics.html#model-synchronization) to have sequelize create the necessary tables, foreign keys and indexes:

> This schema is adapted for use in Sequelize and based upon our main [schema](/reference/adapters/models)

```js
import NextAuth from "next-auth"
import SequelizeAdapter from "@next-auth/sequelize-adapter"
import Sequelize from 'sequelize'

const sequelize = new Sequelize("sqlite::memory:")
const adapter = SequelizeAdapter(sequelize)

// Calling sync() is not recommended in production
sequelize.sync()

export default NextAuth({
  ...
  adapter
  ...
})
```

## Using custom models

Sequelize models are option to customization like so:

```js
import NextAuth from "next-auth"
import SequelizeAdapter, { models } from "@next-auth/sequelize-adapter"
import Sequelize, { DataTypes } from "sequelize"

const sequelize = new Sequelize("sqlite::memory:")

export default NextAuth({
  // https://authjs.dev/reference/providers/
  providers: [],
  adapter: SequelizeAdapter(sequelize, {
    models: {
      User: sequelize.define("user", {
        ...models.User,
        phoneNumber: DataTypes.STRING,
      }),
    },
  }),
})
```
