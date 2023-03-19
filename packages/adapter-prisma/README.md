<p align="center">
   <br/>
   <a href="https://authjs.dev" target="_blank"><img height="64px" src="https://authjs.dev/img/logo/logo-sm.png" /></a>&nbsp;&nbsp;&nbsp;&nbsp;<img height="64px" src="https://raw.githubusercontent.com/nextauthjs/adapters/main/packages/prisma/logo.svg" />
   <h3 align="center"><b>Prisma Adapter</b> - NextAuth.js</h3>
   <p align="center">
   Open Source. Full Stack. Own Your Data.
   </p>
   <p align="center" style="align: center;">
      <img src="https://github.com/nextauthjs/next-auth/actions/workflows/release.yml/badge.svg?branch=main" alt="CI Test" />
      <a href="https://www.npmjs.com/package/@next-auth/prisma-adapter" target="_blank"><img src="https://img.shields.io/bundlephobia/minzip/@next-auth/prisma-adapter/next" alt="Bundle Size"/></a>
      <a href="https://www.npmjs.com/package/@next-auth/prisma-adapter" target="_blank"><img src="https://img.shields.io/npm/v/@next-auth/prisma-adapter/next" alt="@next-auth/prisma-adapter Version" /></a>
   </p>
</p>

## Overview

This is the Prisma Adapter for [`auth.js`](https://authjs.dev). This package can only be used in conjunction with the primary `auth.js` package. It is not a standalone package.

You can find the Prisma schema in the docs at [authjs.dev/reference/adapters/prisma](https://authjs.dev/reference/adapters/prisma).

## Getting Started

1. Install `next-auth` and `@next-auth/prisma-adapter` as well as `prisma` and `@prisma/client`.

```js
npm install next-auth @next-auth/prisma-adapter @prisma/client
npm install --save-dev prisma
```

2. Add this adapter to your `pages/api/[...nextauth].js` next-auth configuration object.

```js
import NextAuth from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import * as Prisma from "@prisma/client"

const prisma = new Prisma.PrismaClient()

// For more information on each option (and a full list of options) go to
// https://authjs.dev/reference/configuration/auth-options
export default NextAuth({
  // https://authjs.dev/reference/providers/oauth-builtin
  providers: [],
  adapter: PrismaAdapter(prisma)
  ...
})
```

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read our [Contributing Guide](https://github.com/nextauthjs/.github/blob/main/CONTRIBUTING.md).

## License

ISC
