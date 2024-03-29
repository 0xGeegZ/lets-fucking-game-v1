# Let's Fucking Game

[![Let's Fucking Game Presentation](http://img.youtube.com/vi/vdYPN0rT-SM/0.jpg)](https://youtu.be/vdYPN0rT-SM "Let's Fucking Game Presentation")

# Description

This application was done during the [ChainLink Hackathon Fall 2022](https://devpost.com/software/let-s-fucking-game-be-the-last-to-win-the-prize)

Hackathon version Release accessible [HERE](https://github.com/lets-fucking-game/lets-fucking-game/releases/tag/0.2.9).

## Contracts deployed on ETHEREUM CHAIN TESTNET GOERLI :

**PRIMARY :**

- GameFactory contract [0xaa318806d683765e6576636a2d88ee14fda9c720](https://goerli.etherscan.io/address/0xaa318806d683765e6576636a2d88ee14fda9c720#code)
- GameV1 BASE contract [0x82BF8997DC54A3E447BcF4E636cBFc45A13D0Ed9](https://goerli.etherscan.io/address/0x82BF8997DC54A3E447BcF4E636cBFc45A13D0Ed9#code)
- CronUpkeep contract [0x45aa5aec20F3019A707D0EFb1C6282c4F0Aea44e](https://goerli.etherscan.io/address/0x45aa5aec20F3019A707D0EFb1C6282c4F0Aea44e#code)

**SECONDARY :**

- CronExternal contract [0xb37EEC7c8a7312687777e4E61c4D2C12e2Fe0DD2](https://goerli.etherscan.io/address/0xb37EEC7c8a7312687777e4E61c4D2C12e2Fe0DD2#code)
- MulticallV3 contracts [0xD960c6f4D7800daFd4508FAE9bD82b9d15CC4608](https://goerli.etherscan.io/address/0xD960c6f4D7800daFd4508FAE9bD82b9d15CC4608#code)

## Contracts deployed on BNB CHAIN TESTNET :

**PRIMARY :**

- GameFactory contract [0x5B4aCc9eCE43900f0edC4C222109cBdE7d374858](https://testnet.bscscan.com/address/0x5B4aCc9eCE43900f0edC4C222109cBdE7d374858#code)
- GameV1 BASE contract [0x5fAC8090B45e9948fb1B8E37d2C9EE95a896c4D1](https://testnet.bscscan.com/address/0x5fAC8090B45e9948fb1B8E37d2C9EE95a896c4D1#code)
- CronUpkeep contract [0xb49E61eA8A132bb507d9AC60ABeBaF8D5e8a500D](https://testnet.bscscan.com/address/0xb49E61eA8A132bb507d9AC60ABeBaF8D5e8a500D#code)

**SECONDARY :**

- CronExternal contract [0x9ccB826aD25Db07D8b86288D7A0ad02dea2c1acC](https://testnet.bscscan.com/address/0x9ccB826aD25Db07D8b86288D7A0ad02dea2c1acC#code)
- MulticallV3 contracts [0x9e5eD465c11ec50DC07481b8c1B69Dee910f28C1](https://testnet.bscscan.com/address/0x9e5eD465c11ec50DC07481b8c1B69Dee910f28C1#code)

## Contracts deployed on POLYGON CHAIN TESTNET MUMBAI :

**PRIMARY :**

- GameFactory contract [0xEC767280c8b789ef260E8e7D63Ee85d023C5F9ea](https://mumbai.polygonscan.com/address/0xEC767280c8b789ef260E8e7D63Ee85d023C5F9ea)
- GameV1 BASE contract [0x4BC8b204ab339969Dc45C631ecc2461F464d34c8](https://mumbai.polygonscan.com/address/0x4BC8b204ab339969Dc45C631ecc2461F464d34c8)
- CronUpkeep contract [0xa9296aF2f631086d52fD02693F2A8996dD4156a0](https://mumbai.polygonscan.com/address/0xa9296aF2f631086d52fD02693F2A8996dD4156a0)

**SECONDARY :**

- CronExternal contracts [0xa66C8C212306f6f41bbA974eeD7F72DCd46a55BB](https://mumbai.polygonscan.com/address/0xa66C8C212306f6f41bbA974eeD7F72DCd46a55BB)
- MulticallV3 contracts [0xCcE2Ce77027F4Cc43Db57Cb400061f5DAaD96b68](https://mumbai.polygonscan.com/address/0xCcE2Ce77027F4Cc43Db57Cb400061f5DAaD96b68)

## Inspiration

We could run into a storytelling exercise and tell you that this was thought of as an innovative new way to engage your web3 community on twitter while providing a simple and fun experience.

And in retrospect, it can be. But the fact is the original goal was just to find a fun way to learn Web3 because in reality... It's just a fucking game :)

## What it does

Let's Fucking Game allows you to create "one button games" to engage your community in order to provide them with a fun way to engage with your content.

The games can be free (the creator deposits the total prizepool of the game) or paid for by the players (the prizepool is composed of the players' registration fees).

Once the total number of players is reached, the game starts.

## How it works

As a player, you'll have to interact with the game smart contract each day during a random time slot. This time slot change everyday and could be during the day or during the night. If you forget just once, you lose.

The last remaining players share the prizes according to the prizepool repartition.

When there is less than 50% players, a player can vote to split pot between remaining players. If all remaining players are ok to split pot then the pot is fairly distributed between remaining players .

The creator can manage the size of the slots and the frequency of the games to make the game last more or less time.

The game creator can also manage the winners structure to allow more or less players to win more or less part of the prizepool.

## How we built it

Mono Repo boilerplate crafted from multiple other boilerplates. This help us to bootstrap this project in the best conditions :

- [https://github.com/hackbg/chainlink-fullstack/](https://github.com/hackbg/chainlink-fullstack/) : For the monorepo configuration
- [https://github.com/emretepedev/solidity-hardhat-typescript-boilerplate](https://github.com/emretepedev/solidity-hardhat-typescript-boilerplate) : For the Smart Contract Project configuration
- [https://github.com/pancakeswap/pancake-frontend](https://github.com/pancakeswap/pancake-frontend) : For the front end project configuration

Smart contract : Solidity, Hardhat and ChainLink Keeper

Front end : Used Nextjs and Etherjs to develop a cross chain dapp

## Challenges we ran into

Our biggest challenge was to control contract size.

We also handle some difficulties is to create one keeper that manage all games. We used ChainLink V8 upKeep contract base and update it to allow management for multiple delegators (each game manage his keeper job Id).

We also have create a Game Factory to manage all games and facilitate games administration.

Finally, we encountered some challenges in the cross-chain administration of the project.

## Accomplishments that we're proud of

The smart contracts are more than 80% covered in tests and this is probably our biggest pride.

We have also created an interface for the games and a generic system that will allow us to easily evolve the game contract to offer games with ERC20 tokens or NFTS.

Finally, the boilerplate we used offers a very quick analysis of our smart contracts with Slither and Mythril which allowed us to respect the best design pattern and the main security standards.

## What we learned

First of all, it is important to know that 4 of the 5 team members had never been initiated to web3 before this project. It was therefore an opportunity for them to discover all these technologies.

We learned a lot about web3, both in terms of smart contracts, Hardhat and interfacing with etherJs.

It's also the first cross-chain project I've worked on and I've learned a lot about how to architect a project for that.

Finally, I manipulated for the first time the hardhat deploy plugin which make easier management of deployments as well as the tests thanks to fixtures.

I plan to create a boilerplate based on this project for all my future web3 developments.

## What's next for LFG

In the short term, we intend to launch the project on the BNB Chain and on Polygon at least.

We would then like to add the possibility of depositing NFTs in the prizepool as this is the use case that made us want to embark on this adventure.

Rather than organizing Twitter contests to win an NFT, why not offer several people in the community the opportunity to sign up for a game and be the actor of their victory? That would be much more fun.

Then, we would like to interface with the ChainLink Data Feed service to allow the creator of the game to ask for an action on Twitter (like, share, comment) and a proof in order to register to the game.

Lfg would thus become a real social engagement tool for its web3 community, especially for influencer or NFTs projects.

It will also be necessary to improve the architecture of the smart contracts, in particular to optimize them and optimize gas costs.

Last, we would like to use Ethereum Push Notification to improve user experience and why not add ChainLink VRF to randomize in a better way the daily time range generation.

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

- React Hooks for Data Fetching with [SWR](https://swr.vercel.app/)
- State Management with [Redux](https://react-redux.js.org/)
- Hooking with [Wagmi](https://github.com/wagmi-dev/wagmi)
- Securing with [Mythril](https://github.com/ConsenSys/mythril)
- Analyzing with [Slither](https://github.com/crytic/slither)
- Coverage with [Solidity Coverage](https://github.com/sc-forks/solidity-coverage)
- Linting with [Solhint](https://github.com/protofire/solhint)
- Linting with [ESLint](https://eslint.org)
- Formatting with [Prettier](https://prettier.io)
- Designing with [Emotion](https://emotion.sh/docs/introduction)

Deployment :

- Deploying with [Vercel](https://vercel.com/)
- Containerization with [Docker Compose](https://docs.docker.com/compose/)
- CI / CD with [Github Action](https://github.com/features/actions)

# Quick Start

## Requirements

- [Node](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)
- [Git](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/)

### Clone the repo:

```bash
git clone https://github.com/lets-fucking-game/lets-fucking-game
cd lets-fucking-game
```

### Install all dependencies:

```bash
yarn install      # install deps
yarn run build    # install solc and other tools in the docker image
```

Don't forget to copy the .env.example file to a file named .env, and then edit it to fill in the details.

### Start up the local Hardhat network and deploy all contracts:

```bash
yarn chain
```

### Startup the dapp

In a second terminal start up the local development server run the front-end app:

```bash
yarn dev
```

### Metamask configuration

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

SEE [hardhat package.json](./packages/hardhat/package.json) to see all deployment commands.

## Auto-Funding

The Hardhat project will attempt to auto-fund the keeper deployed contract, which otherwise has to be done manually.

The amount in LINK to send as part of this process can be modified in this [Hardhat Config](https://github.com/lets-fucking-game/lets-fucking-game/blob/main/packages/hardhat/helper-hardhat-config.ts), and are configurable per network.

| Parameter  | Description                                       | Default Value |
| ---------- | :------------------------------------------------ | :------------ |
| fundAmount | Amount of LINK to transfer when funding contracts | 1 LINK        |

## Verify on Blockchain Explorers

You'll need an `Blockchain Explorers API Key` configured in your env file.

All deployment script include verify part.

For more information, SEE the [README](./packages/hardhat/README.md).

## Test

If the test command is executed without a specified network it will run locally and only perform the unit tests:

```bash
yarn test:contracts
```

For coverage report:

```bash
yarn coverage:contracts
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

# Miscellaneous

SEE [hardhat package](./packages/hardhat/) to see all smart contracts miscellaneous.
SEE [dapp package](./packages/dapp/) to see all dapp miscellaneous.

## References

- [Chainlink Docs](https://docs.chain.link)
