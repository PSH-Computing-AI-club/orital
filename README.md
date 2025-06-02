<div align="center">

# Orital Club Portal Solution

Portal web application for the PSH Computing & AI Club.

</div>

## Packages

This is a monorepo. Every major component in the Orital Club Portal Solution is split up into its own separate package with shared dependencies.

| Package                                    | Description                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------ |
| [`packages/ergates`](./packages/ergates)   | Virtual machine requisition agent for the Orital project.                |
| [`packages/ypiretis`](./packages/ypiretis) | Backend web services and frontend user interface for the Orital project. |

## Development

Each package within the Orital Club Portal Solution has its own sets of commands, dependencies, and so on. Please consult the individual packages for their development conventions.

## Contributing

External contributions are not accepted. Consider this repository read-only for all non-club members.

### Formatting

> [!NOTE]
> If you are using [VS Code](https://code.visualstudio.com) and have the recommended extensions installed, then VS Code will enforce formatting on save.

All code formatting is delegated to [Prettier](https://prettier.io) and the configuration is found in [`.prettierrc`](./.prettierrc).

### Linting

> [!NOTE]
> If you are using [VS Code](https://code.visualstudio.com) and have the recommended extensions installed, then VS Code will enforce warn about linting errors on type.

All code linting is delegated to [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) and the configuration is found in [`.oxlintrc.json`](./.oxlintrc.json).

## Support

This software is provided as-is with no support given.

## License

The Orital Club Portal Solution is [licensed](./LICENSE) under the MIT License.
