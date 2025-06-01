<div align="center">

# Orital Ypiretis

Backend web services and frontend user interface for the Orital project.

</div>

## Deployment

> **TODO:** DO DIS!

...

## Development

To begin development, follow the steps outlined below as needed.

### Prerequisites

Below is the table of software required to develop this software:

| Software                                 | Tested Version |
| ---------------------------------------- | -------------- |
| [Bun JavaScript Runtime](https://bun.sh) | `>=1.2.X`      |

### 1. Clone

Clone the repository via terminal:

```shell
git clone https://github.com/PSH-Computing-AI-club/orital
```

### 2. Install Dependencies

Install all dependencies via [Bun](https://bun.sh):

```shell
bun install --frozen-lockfile
```

### 3. Open VS Code

Make sure to open [VS Code](https://code.visualstudio.com) at the root directory of the monorepo. _Not_ at the package directory.

### 4. [OPTIONAL] Recommended VS Code Extensions

If you are using VS Code, then you should be prompted to install the recommended extensions for the project.

### 5. Create a `.env.development` file.

Create a copy of the [`.sample.env`](./.sample.env) configuration file and rename it to `.env.development`. Customize the file as necessary.

### 6. [OPTIONAL] Generate Database Migration Scripts

If you make changes in the [`./app/.server/database/tables`](./app/.server/database/tables) directory, then you _must_ generate new migration scripts via `bun run db:migrations:generate`.

### 7. Run Database Migration Scripts

You need to create your initial development SQLite3 database by running `bun run db:migrations:run`.

### 8. Run Development Server

Finally, start the web application development start by running `bun app:dev`. You should be provided the URL to connect to by the terminal output.

## Package Commands

| Command                               | Description                                                                                                                                                          |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run app:build`                   | Uses the [React Router](https://reactrouter.com) CLI to build the production web application server.                                                                 |
| `bun run app:dev`                     | Uses the [Vite](https://vite.dev) CLI to start the local-development web application server.                                                                         |
| `bun run app:start`                   | Uses the [Bun](https://bun.sh) CLI to run the previously built production web application server.                                                                    |
| `bun run check:types`                 | Generates all needed types and then uses the [TypeScript](https://www.typescriptlang.org) compiler to run check type checking.                                       |
| `bun run db:migrations:generate`      | Uses the [Drizzle Kit](https://orm.drizzle.team) CLI to generate [SQLite3](https://www.sqlite.org) migration scripts.                                                |
| `bun run db:migrations:run`           | Uses a helper script that utilizes the [Drizzle ORM](https://orm.drizzle.team) to run the previously generated migration scripts.                                    |
| `bun run types:generate:react-router` | Uses the [React Router](https://reactrouter.com) CLI to generate [TypeScript](https://www.typescriptlang.org) typings of the routes in [`app/routes`](./app/routes). |
