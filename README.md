# Let's Fucking Game

This application was done during the [Chainlink Hackathon Fall 2022](https://chainlinkfall2022.devpost.com/)

TODO UPDATE DEMO LINK
[LIVE DEMO](https://chainlink-demo.app)

## Inspiration

We could run into a storytelling exercise and tell you that this was thought of as an innovative new way to engage your web3 community on twitter while providing a simple and fun experience.

And in retrospect, it can be. But the fact is the original goal was just to find a fun way to learn Web3 because in reality... It's just a fucking game :)

## What it does

Let's Fucking Game allows you to create "One button games" and propose them to your twitter community.

The games can be free (the creator deposits the total prizepool of the game) or paid for by the players (the prizepool is composed of the players' registration fees).

Once the total number of players is reached, the game starts.

## How it works

Each day, as a player you have a random time slot during which you have to log in and validate your presence. If you forget, you lose.

The last remaining players share the prizes according to the prizepool repartition.

When there is less than 50% players, a player can vote to split pot between remaining players. If all remaining players are ok to split pot then the pot is fairly distributed between remaining players .

The creator can manage the size of the slots and the frequency of the games to make the game last more or less time.

The game creator can also manage the winners structure to allow more or less players to win more or less part of the prizepool.

## How we built it

Mono Repo boilerplate crafted from multiple other boileplates. This help us to bootstrap this project in the best conditions :

- https://github.com/hackbg/chainlink-fullstack/ : For the monorepo configuration
- [https://github.com/emretepedev/solidity-hardhat-typescript-boilerplate](https://github.com/emretepedev/solidity-hardhat-typescript-boilerplate) : For the Smart Contract Project configuration
- https://github.com/pancakeswap/pancake-frontend : For the front end project configuration

Smart contract : Solidity, Hardhat and Chainlink Keeper

Front end : Used Nextjs and Etherjs to develop a cross chain dapp

## Challenges we ran into

Our biggest challenge is to create one keeper that manage all games. We used ChainLink V8 upKeep contract base and update it to allow management for multiple delegators.

We also have create a Game Factory to manage all games and facilitate games administration management.

Finally, we encountered some challenges in the multi-chain administration of the project.

## Accomplishments that we're proud of

The smart contracts are more than 80% covered in tests and this is probably our biggest pride.

We have also created an interface for the games and a genericity system that will allow us to easily evolve the game contract to offer games with ERC20 tokens or NFTS.

Finally, the boilerplate we used offers a very quick analysis of our smart contracts with Slither and Mythril which allowed us to respect the best design pattern and the main security standards.

## What we learned

First of all, it is important to know that 4 of the 5 team members had never been initiated to web3 before this project. It was therefore an opportunity for them to discover all these technologies.

We learned a lot about web3, both in terms of smart contracts and interfacing with etherJs.

It's also the first cross-chain project I've worked on and I've learned a lot about how to architect a project for that.

Finally, I manipulated for the first time the hardhat deploy plugin which facilitates enormously the management of deployments as well as the tests thanks to fixtures.

I plan to create a boilerplate based on this project for all my future web3 developments.

## What's next for LFG

In the short term, we intend to launch the project on the NBB Chain and on Polygon at least.

We would then like to add the possibility of depositing NFTs in the prizepool as this is the use case that made us want to embark on this adventure.

Rather than organizing draws on twitter to win an NFT, why not offer several people in the community the opportunity to sign up for a game and be the actor of their victory? That would be much more fun.

Then, we would like to interface with the chainlink Data Feed service to allow the creator of the game to ask for an action on Twitter (like, share, comment) and a proof in order to register to the game.

Lfg would thus become a real social engagement tool for its web3 community, especially for influencer or NFTs projects.

It will also be necessary to improve the architecture of the smart contracts, in particular to optimize them and optimize the gas costs.

Last, we would like to use Ethereum Push Notification to improve user experience and why not add Chainlink VRF to randomize in a better way the daily time range generation.

## Built with

Primary :

- [TypeScript](https://www.typescriptlang.org)
- [Solidity](https://docs.soliditylang.org/en/v0.8.17/)
- [Next.js](https://nextjs.org)
- [Hardhat](https://hardhat.org)
- [Ethers.js](https://docs.ethers.io/v5/)
- [Chainlink Keeper](https://docs.chain.link/docs/chainlink-automation/introduction/)
- [TypeChain](https://github.com/dethcrypto/TypeChain)

Secondary :

- Hooking with [Wagmi](https://github.com/wagmi-dev/wagmi)
- Securing with [Mythril](https://github.com/ConsenSys/mythril)
- Analyzing with [Slither](https://github.com/crytic/slither)
- Coverage with [Solidity Coverage](https://github.com/sc-forks/solidity-coverage)
- Linting with [Solhint](https://github.com/protofire/solhint)
- Linting with [ESLint](https://eslint.org)
- Formatting with [Prettier](https://prettier.io)
- Designing with [Emotion](https://emotion.sh/docs/introduction)

## Requirements

- [Node](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)
- [Git](https://git-scm.com/downloads)

## Quick Start

Clone the repo and install all dependencies:

```bash
git clone https://github.com/lets-fucking-game/lets-fucking-game
cd lets-fucking-game

yarn install
```

Start up the local Hardhat network and deploy all contracts:

```bash
yarn chain
```

In a second terminal start up the local development server run the front-end app:

```bash
yarn dev
```

To interact with the local network, follow this step-by-step guide on how to use [MetaMask with a Hardhat node](https://support.chainstack.com/hc/en-us/articles/4408642503449-Using-MetaMask-with-a-Hardhat-node).

If you've set the mnemonic from MetaMask the first 20 accounts will be funded with ETH.

## Environment Variables

To make setting environment variables easier there are `.env.example` files in the `hardhat` and `dapp` workspaces. You can copy them to new `.env` files and replace the values with your own.

#### Hardhat

| Name                          | Description                                                                                                                                                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NETWORK_RPC_URL`             | One key by RCP network (see env.example). Required to deploy to public networks. Obtain from [Infura's site](https://infura.io).                                                                                                   |
| `DEPLOYER_WALLET_PRIVATE_KEY` | The private key of the account which will send the deployment transaction. The account must have enough ETH to deploy the contracts, as well as LINK which can be obtained from [Chainlink's faucets](https://faucets.chain.link). |
| `ETHERSCAN_API_KEY`           | Your Etherscan API key to verify contract code on Etherscan.                                                                                                                                                                       |

#### Front-end

| Name                     | Description                       |
| ------------------------ | --------------------------------- |
| `NEXT_PUBLIC_INFURA_KEY` | Read-only mode and WalletConnect. |

## Deploy Contracts

This will run the deploy scripts to a local Hardhat network:

```bash
yarn deploy
```

Update this command line to deploy all smart contract a on specific network.

## Auto-Funding

The Hardhat project will attempt to auto-fund any newly deployed contract that uses Any-API or VRF, which otherwise has to be done manually.

The amount in LINK to send as part of this process can be modified in this [Hardhat Config](https://github.com/lets-fucking-game/lets-fucking-game/blob/main/packages/hardhat/helper-hardhat-config.ts), and are configurable per network.

| Parameter  | Description                                       | Default Value |
| ---------- | :------------------------------------------------ | :------------ |
| fundAmount | Amount of LINK to transfer when funding contracts | 1 LINK        |

If you wish to deploy the smart contracts without performing the auto-funding, run the following command when doing your deployment:

```bash
yarn deploy <NETWORK> <CONTRACT>
```

## Test

If the test command is executed without a specified network it will run locally and only perform the unit tests:

```bash
yarn test:contracts
```

Integration tests must be run on a public testnet that has Chainlink oracles responding:

```bash
yarn test:contracts --network kovan
```

For coverage report:

```bash
yarn coverage:contracts
```

## Verify on Etherscan

You'll need an `ETHERSCAN_API_KEY` environment variable. You can get one from the [Etherscan API site.](https://etherscan.io/apis)

```bash
npx hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
```

example:

```bash
npx hardhat verify --network kovan 0x9279791897f112a41FfDa267ff7DbBC46b96c296 "0x9326BFA02ADD2366b30bacB125260Af641031331"
```

## Format

Fix formatting according to prettier config in the respective workspace:

```bash
yarn format:dapp
yarn format:hardhat
```

## Lint

```bash
yarn lint:dapp
```

## References

- [Chainlink Docs](https://docs.chain.link)
- [Chainlink Fullstack Repo](https://github.com/hackbg/chainlink-fullstack/)
