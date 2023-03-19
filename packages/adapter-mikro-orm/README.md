<p align="center">
   <br/>
   <a href="https://authjs.dev" target="_blank"><img height="64px" src="https://authjs.dev/img/logo/logo-sm.png" /></a>&nbsp;&nbsp;&nbsp;&nbsp;<img height="64px" src="https://raw.githubusercontent.com/nextauthjs/adapters/main/packages/mikro-orm/logo.svg" />
   <h3 align="center"><b>Mikro ORM Adapter</b> - NextAuth.js</h3>
   <p align="center">
   Open Source. Full Stack. Own Your Data.
   </p>
   <p align="center" style="align: center;">
      <img src="https://github.com/nextauthjs/next-auth/actions/workflows/release.yml/badge.svg?branch=main" alt="CI Test" />
      <a href="https://www.npmjs.com/package/@next-auth/mikro-orm-adapter" target="_blank"><img src="https://img.shields.io/bundlephobia/minzip/@next-auth/mikro-orm-adapter/next" alt="Bundle Size"/></a>
      <a href="https://www.npmjs.com/package/@next-auth/mikro-orm-adapter" target="_blank"><img src="https://img.shields.io/npm/v/@next-auth/mikro-orm-adapter/next" alt="@next-auth/mikro-orm-adapter Version" /></a>
   </p>
</p>

## Overview

This is the MikroORM Adapter for [`auth.js`](https://authjs.dev). This package can only be used in conjunction with the primary `auth.js` package. It is not a standalone package.

## Getting Started

1. Install `next-auth` and `@next-auth/mikro-orm-adapter`

   ```js
   npm install next-auth @next-auth/mikro-orm-adapter@next
   ```

2. Add this adapter to your `pages/api/[...nextauth].ts` next-auth configuration object.

   ```typescript title="pages/api/auth/[...nextauth].ts"
   import NextAuth from "next-auth"
   import { MikroOrmAdapter } from "@next-auth/mikro-orm-adapter"

   // For more information on each option (and a full list of options) go to
   // https://authjs.dev/reference/configuration/auth-options
   export default NextAuth({
      // https://authjs.dev/reference/providers/oauth-builtin
      providers: [],
      adapter: MikroOrmAdapter({
         dbName: "./db.sqlite",
         type: "sqlite",
         debug: process.env.DEBUG === "true" || process.env.DEBUG?.includes("db"),
         ...
      }, {
         // pass extended models as { entities: { } } if needed
      }),
      ...
   });
   ```

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read our [Contributing Guide](https://github.com/nextauthjs/.github/blob/main/CONTRIBUTING.md).

## License

ISC
