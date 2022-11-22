# Let's Fucking Game

[![Let's Fucking Game Presentation](http://img.youtube.com/vi/vdYPN0rT-SM/0.jpg)](https://youtu.be/vdYPN0rT-SM "Let's Fucking Game Presentation")

# Description

This application was done during the [ChainLink Hackathon Fall 2022](https://devpost.com/software/let-s-fucking-game-be-the-last-to-win-the-prize)

## Contracts deployed on ETHEREUM CHAIN TESTNET GOERLI :

**PRIMARY :**

- GameFactory contract [0xd768B91254ed4EA00F51A281B1095Bb7840Ccd73](https://goerli.etherscan.io/address/0xd768B91254ed4EA00F51A281B1095Bb7840Ccd73#code)
- GameV1 BASE contract [0x19B4F2603DA9d3AA6a7068B314f29FEe3a3eCD69](https://goerli.etherscan.io/address/0x19B4F2603DA9d3AA6a7068B314f29FEe3a3eCD69#code)

**SECONDARY :**

- CronUpkeep contract [0x76775c74A54799792B39D1cfD1EFEEBE0344c616](https://goerli.etherscan.io/address/0x76775c74A54799792B39D1cfD1EFEEBE0344c616#code)
- CronExternal contract [0x028108eb5f57f0f18db335208638f7e3a7f8a92f](https://goerli.etherscan.io/address/0x028108eb5f57f0f18db335208638f7e3a7f8a92f#code)
- MulticallV3 contracts [0x3cB1f308f9cDF098968Cb805339936FaB72ECD72](https://goerli.etherscan.io/address/0x3cB1f308f9cDF098968Cb805339936FaB72ECD72#code)

## Contracts deployed on BNB CHAIN TESTNET :

**PRIMARY :**

- GameFactory contract [0xc5ABe709741c7758A77ef72edDdFD9aCA1d08E70](https://testnet.bscscan.com/address/0xc5ABe709741c7758A77ef72edDdFD9aCA1d08E70#code)
- GameV1 BASE contract [0x6599a4Bee1ffc4147D9Ae026C2f170436bB8Bb47](https://testnet.bscscan.com/address/0x6599a4Bee1ffc4147D9Ae026C2f170436bB8Bb47#code)

**SECONDARY :**

- CronUpkeep contract [0x6c7D3691C790953c00e5b9Ea7C18c046ECC6AD7B](https://testnet.bscscan.com/address/0x6c7D3691C790953c00e5b9Ea7C18c046ECC6AD7B#code)
- CronExternal contract [0x9F0660311430F0a6a17f8782E77DBC7C16C1BFe2](https://testnet.bscscan.com/address/0x9F0660311430F0a6a17f8782E77DBC7C16C1BFe2#code)
- MulticallV3 contracts [0x41b0b067797B8DfFb2299c133C78aae08C0fDb86](https://testnet.bscscan.com/address/0x41b0b067797B8DfFb2299c133C78aae08C0fDb86#code)

## Contracts deployed on POLYGON CHAIN TESTNET MUMBAI :

**PRIMARY :**

- GameFactory contract [0x5A56D0D7BD2Db9d96E37F9187CbeE398315a57e2](https://mumbai.polygonscan.com/address/0x5A56D0D7BD2Db9d96E37F9187CbeE398315a57e2)
- GameV1 BASE contract [0x7DA3e4C4B95CfDE7d919104f63A006697018D4f0](https://mumbai.polygonscan.com/address/0x7DA3e4C4B95CfDE7d919104f63A006697018D4f0)

**SECONDARY :**

- CronUpkeep contract [0x8a88c6EEd4DF773643b1A2EEAA0CB128Ed18820A](https://mumbai.polygonscan.com/address/0x8a88c6EEd4DF773643b1A2EEAA0CB128Ed18820A)
- CronExternal contracts [0x039B8906C439756969928FdAa7c0a78Bd302201c](https://mumbai.polygonscan.com/address/0x039B8906C439756969928FdAa7c0a78Bd302201c)
- MulticallV3 contracts [0x7858258c475BDE1b07451A9e76C65dc078584b60](https://mumbai.polygonscan.com/address/0x7858258c475BDE1b07451A9e76C65dc078584b60)

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
