# RAGNA - Cloud Platform

## ToDo's

- [ ] proper access & api policy
- [ ] roles & permissions

## Introduction

This is a [sidebase merino](https://sidebase.io/) app created by running `npm create sidebase@latest`. This project uses the following packages:

- [TypeScript](https://www.typescriptlang.org/)
- [Nuxt 3](https://nuxt.com)
- Prisma ORM
- nuxt-auth
- tRPC 10
- trpc-nuxt
- tailwindcss
- shadcn-vue
- nuxt-i18n
- nuxt-pinia
- nuxt-security
- vueuse/core
- socket.io
- tiptap editor with custom extensions
- zod
- vee-validate & vee-zod
- bullmq
- llamaindex
- tiktoken
- stripe
- slack-notify
- redis-client
- vercel ai sdk

Info: do not use @vueuse/nuxt, because it is not compatible with this project.

## Getting Started

### Setup

Requires **next-auth@4.21.1**. If you are using a newer version, you will need to downgrade.

```bash
npm install next-auth@4.21.1
```

Make sure to install the project dependencies:

```bash
npm install
```

### Development Server

Docker build for development:

```bash
docker build -t ragna/cloud-platform-dev -f Dockerfile .
```

Start the development server on http://localhost:3000

```bash
npm run dev
```

### Production

Docker build for production:

```bash
docker build -t ragna/cloud-platform -f Dockerfile.prod .
```

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```


"seed": "ts-node --compiler-options {\"module\":\"CommonJS\",\"verbatimModuleSyntax\":false,\"types\":[\"node\"]} prisma/seed.ts"
