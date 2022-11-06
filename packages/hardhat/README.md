# Let's Fucking Game - Smart Contract

# Coverage Report

| Statements                                                                         | Functions                                                                        | Lines                                                                    |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| ![Statements](https://img.shields.io/badge/statements-71.73%25-red.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-65.19%25-red.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-67.43%25-red.svg?style=flat) |

# Prerequisites

```shell
yarn install      # install deps
yarn run build    # install solc and other tools in the docker image
```

Don't forget to copy the .env.example file to a file named .env, and then edit it to fill in the details.

# Running all the tests

```shell
yarn run test             # run tests on hardhat network
yarn run test:trace       # shows logs + calls
yarn run test:fresh       # force compile and then run tests
yarn run test:coverage    # run tests on ganache with coverage reports
```

# Formatters & Linters

You can use the below packages,

- [Solhint](https://github.com/protofire/solhint)
- [ESLint](https://eslint.org)
- [Prettier](https://prettier.io/)
- [CSpell](https://cspell.org/)
- [ShellCheck](https://www.shellcheck.net/)

```shell
yarn run format
yarn run lint
```

# Analyzers

You can use the below tools,

- [Slither](https://github.com/crytic/slither)
- [Mythril](https://github.com/ConsenSys/mythril)

```shell
yarn run analyze:static path/to/contract
yarn run analyze:security path/to/contract
yarn run analyze:all path/to/contract
```

# Deploy Contract & Verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details.

| Name                          | Description                                                                                                                                                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NETWORK_RPC_URL`             | One key by RCP network (see env.example). Required to deploy to public networks. Obtain from [Infura's site](https://infura.io).                                                                                                   |
| `DEPLOYER_WALLET_PRIVATE_KEY` | The private key of the account which will send the deployment transaction. The account must have enough ETH to deploy the contracts, as well as LINK which can be obtained from [Chainlink's faucets](https://faucets.chain.link). |
| `ETHERSCAN_API_KEY`           | You'll need an `Blockchain Explorers API Key` configured in your env file. You can get one from the [Etherscan API site.](https://etherscan.io/apis) for example.                                                                  |

With a valid .env file in place, first deploy your contract:

To deploy all contracts :

```shell
yarn run deploy:all <NETWORK>
```

To deploy contracts for a specific tag :

```shell
yarn run deploy <NETWORK> <TAG>
```

Also, you can add contract(s) manually to your tenderly projects from the output.
`https://dashboard.tenderly.co/contract/<NETWORK_NAME>/<CONTRACT_ADDRESS>`

And then verify it:

```shell
yarn run verify <NETWORK> <DEPLOYED_CONTRACT_ADDRESS> "<CONSTRUCTOR_ARGUMENT(S)>"
```

SEE [hardhat.config.ts](./hardhat.config.ts) to see all networks

# Miscellaneous

```shell
yarn run generate:docs    # generate docs according to the contracts/ folder
```

```shell
yarn run generate:flatten ./path/to/contract     # generate the flatten file (path must be "./" prefixed)
yarn run generate:abi ./path/to/contract         # generate the ABI file (path must be "./" prefixed)
yarn run generate:bin ./path/to/contract         # generate the binary in a hex (path must be "./" prefixed)
yarn run generate:metadata ./path/to/contract    # generate the metadata (path must be "./" prefixed)
yarn run generate:all-abi
yarn run generate:all-bin
yarn run generate:all-metadata
```

```shell
yarn run share    # share project folder with remix ide
```
