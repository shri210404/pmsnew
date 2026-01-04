## Description

MPS REST API repository. Developed with [NestJS](https://github.com/nestjs/nest) framework.

## Pre-Requisite

LTS version of [Node.JS](https://nodejs.org/en)

Node.JS Version used: *18.20.4 (LTS)*

## Installation

```bash
$ npm install
```

## Setup: environment variables

Create a **.env** file in the root of the project. This file should contain the below variables:

```bash
# Application specific config
APP_PORT=3005
APP_HOST=localhost

APP_COOKIE_SECRET=<RANDOM_STRING>

# Refresh token name and length (Max 32 allowed).
REFRESH_TOKEN_NAME=c-mps-refresh
REFRESH_TOKEN_LENGTH=32

# Log config
LOG_DIR='logs'
LOG_MAX_SIZE=50000

DATABASE_URL=<MYSQL_CONNECTION_STRING>

# Logging to remote MongoDb (0 => enabled, 1 => disabled).
ALLOW_DB_LOG=0

LOG_DB_URI=<MONGO_DB_CONNECTION_STRING>
LOG_DB_NAME=mpslogs
LOG_DB_TABLE=apilogs
```

>[!TIP]
> You can create a free mongodb atlas cluster following this [youtube video](https://www.youtube.com/watch?v=VkXvVOb99g0).

## Setup: Database

We are using **mysql**, and [prisma](https://www.prisma.io/orm) ORM for this project. For quickstart you can follow [this guide](https://www.prisma.io/docs/getting-started/quickstart).

For integrating **Prisma**, please follow the steps:
```bash
# Step 1: Install prisma as a dev-dependency
npm i -D prisma

# Step 2: Initialize prisma for mysql
npx prisma init --datasource-provider mysql

# Step 3: Install mysql2 package
npm i -S mysql2

# Step 4: Run migrations to prepare the databases.
# The name "init" refers to a migration step in /prisma/migrations/ directory.
# You can refer to any migration you'd like to. Choose the latest one for most compatibility.
npx prisma migrate dev --name init
```

## Setup: Security 

Create a directory _**"certs"**_ at the root of the project. Then apply the below commands for generating public and private key pair.
These will be used for signing and validating the JWT tokens; We are using ES512 algorithm.
```bash
# generate private key. Don't rename `private.key` - as it is being used internally.
openssl ecparam -name secp521r1 -genkey -noout -out ./private.key

# generate public key. Don't rename `public.pem` - as it is being used internally.
openssl ec -in ./private.key -pubout -out ./public.pem
```

> [!IMPORTANT]
> You must move to _**"certs"**_ directory and issue these commands. Else you have to modify the relative paths accordingly.



## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Swagger Access

When application is started locally, visit "http://<host_name>:<port_number>/swagger" (e.x. http://localhost:3005/swagger) for definitions;