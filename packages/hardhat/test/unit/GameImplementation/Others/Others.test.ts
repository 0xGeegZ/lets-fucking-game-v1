// TODO UPDATE
// import { anyValue } from '@nomicfoundation/hardhat-chai-matchers/withArgs'
// import { expect } from 'chai'
// import { expectRevert } from '@openzeppelin/test-helpers'
// import { ethers } from 'hardhat'

// import { beforeEachGameFactory } from '../../helpers/helpers'

// END TODO

// const { anyValue } = require('@nomicfoundation/hardhat-chai-matchers/withArgs')
// const { expectRevert } = require('@openzeppelin/test-helpers')
// const { expect } = require('chai')
// const { ethers } = require('hardhat')

// const {
//   ONE_HOUR_IN_SECOND,
//   ONE_DAY_IN_SECONDS,
//   beforeEachGameImplementation,
//   registerPlayer,
//   setUpGameReadyToPlay,
//   makePlayerLooseForNotPlaying,
//   setUpGameWithAWinner,
// } = require('../../../helpers/helpers')

// describe('GameImplementationContract - Others', function () {
//   beforeEach(beforeEachGameImplementation)

//   context('Creator functions', function () {
//     describe('setGameName', function () {
//       describe('when caller is not the creator', function () {
//         it('should revert with correct error message', async function () {
//           await expectRevert(
//             this.contract.connect(this.generalAdmin).setGameName('New name'),
//             'Caller is not the creator'
//           )
//         })
//       })

//       describe('when caller is the creator', function () {
//         it('should change the name of the Game Line', async function () {
//           const newName = 'New name'
//           await this.contract.connect(this.creator).setGameName(newName)
//           const updatedName = await this.contract.gameName()
//           expect(updatedName).to.be.equal(newName)
//         })
//       })
//     })

//     describe('setGameImage', function () {
//       describe('when caller is not the creator', function () {
//         it('should revert with correct error message', async function () {
//           await expectRevert(
//             this.contract
//               .connect(this.generalAdmin)
//               .setGameImage('https://www.new-ipfs-image.com'),
//             'Caller is not the creator'
//           )
//         })
//       })

//       describe('when caller is the creator', function () {
//         it('should change the image link of the Game Line', async function () {
//           const newImageLink = 'https://www.new-ipfs-image.com'
//           await this.contract.connect(this.creator).setGameImage(newImageLink)
//           const updatedImage = await this.contract.gameImage()
//           expect(updatedImage).to.be.equal(newImageLink)
//         })
//       })
//     })

//     describe('withdrawCreatorEdge', function () {
//       describe('when caller is not the creator', function () {
//         it('should revert with correct error message', async function () {
//           await expectRevert(
//             this.contract.connect(this.generalAdmin).withdrawCreatorEdge(),
//             'Caller is not the creator'
//           )
//         })
//       })

//       describe('when caller is the creator', function () {
//         it('should withdraw the creator edge', async function () {
//           await setUpGameReadyToPlay({
//             players: this.players,
//             contract: this.contract,
//             amount: this.correctRegistrationAmount,
//             mockKeeper: this.mockKeeper,
//           })
//           const initialContractBalance = await ethers.provider.getBalance(
//             this.contract.address
//           )
//           const initialCreatorBalance = await ethers.provider.getBalance(
//             this.creator.address
//           )
//           const tx = await this.contract
//             .connect(this.creator)
//             .withdrawCreatorEdge()

//           const receipt = await tx.wait()
//           const gasPrice = tx.gasPrice
//           const gasUsed = receipt.gasUsed

//           const updatedContractBalance = await ethers.provider.getBalance(
//             this.contract.address
//           )
//           const updatedCreatorBalance = await ethers.provider.getBalance(
//             this.creator.address
//           )

//           expect(updatedContractBalance).to.be.equal(
//             initialContractBalance.sub(this.creatorEdge)
//           )
//           expect(updatedCreatorBalance).to.be.equal(
//             initialCreatorBalance
//               .add(this.creatorEdge)
//               .sub(gasPrice.mul(gasUsed))
//           )
//         })
//       })
//     })
//   })

//   context('Admin functions', function () {
//     describe('withdrawAdminEdge', function () {
//       describe('when caller is not the general admin', function () {
//         it('should revert with correct error message', async function () {
//           await expectRevert(
//             this.contract.connect(this.creator).withdrawAdminEdge(),
//             'Caller is not the creator'
//           )
//         })
//       })

//       describe('when caller is the general admin', function () {
//         it('should withdraw the general admin edge', async function () {
//           await setUpGameReadyToPlay({
//             players: this.players,
//             contract: this.contract,
//             amount: this.correctRegistrationAmount,
//             mockKeeper: this.mockKeeper,
//           })
//           const initialContractBalance = await ethers.provider.getBalance(
//             this.contract.address
//           )
//           const initialAdminBalance = await ethers.provider.getBalance(
//             this.generalAdmin.address
//           )
//           const tx = await this.contract
//             .connect(this.generalAdmin)
//             .withdrawAdminEdge()

//           const receipt = await tx.wait()
//           const gasPrice = tx.gasPrice
//           const gasUsed = receipt.gasUsed

//           const updatedContractBalance = await ethers.provider.getBalance(
//             this.contract.address
//           )
//           const updatedAdminBalance = await ethers.provider.getBalance(
//             this.generalAdmin.address
//           )

//           expect(updatedContractBalance).to.be.equal(
//             initialContractBalance.sub(this.houseEdge)
//           )
//           expect(updatedAdminBalance).to.be.equal(
//             initialAdminBalance.add(this.houseEdge).sub(gasPrice.mul(gasUsed))
//           )
//         })
//       })
//     })
//   })

//   context('Emergency functions', function () {
//     describe('withdrawFunds', function () {
//       describe('when caller is not the general admin or creator', function () {
//         it('should revert with correct message', async function () {
//           await expectRevert(
//             this.contract
//               .connect(this.players[5])
//               .withdrawFunds(this.players[5].address),
//             'Caller is not the creator'
//           )
//         })
//       })

//       describe('when caller is the general admin', function () {
//         it('should withdraw all the contract funds and transfer them to the given address', async function () {
//           const fundReceiverAddress = this.players[5].address
//           await setUpGameReadyToPlay({
//             players: this.players,
//             contract: this.contract,
//             amount: this.correctRegistrationAmount,
//             mockKeeper: this.mockKeeper,
//           })
//           const initialContractBalance = await ethers.provider.getBalance(
//             this.contract.address
//           )
//           const initialReceiverBalance = await ethers.provider.getBalance(
//             fundReceiverAddress
//           )

//           await this.contract
//             .connect(this.generalAdmin)
//             .withdrawFunds(fundReceiverAddress)

//           const updatedContractBalance = await ethers.provider.getBalance(
//             this.contract.address
//           )
//           const updatedReceiverBalance = await ethers.provider.getBalance(
//             fundReceiverAddress
//           )

//           expect(updatedContractBalance).to.be.equal(0)
//           expect(updatedReceiverBalance).to.be.equal(
//             initialReceiverBalance.add(initialContractBalance)
//           )
//         })
//       })

//       describe('when caller is the creator', function () {
//         it('should withdraw all the contract funds and transfer them to the given address', async function () {
//           const fundReceiverAddress = this.players[5].address
//           await setUpGameReadyToPlay({
//             players: this.players,
//             contract: this.contract,
//             amount: this.correctRegistrationAmount,
//             mockKeeper: this.mockKeeper,
//           })
//           const initialContractBalance = await ethers.provider.getBalance(
//             this.contract.address
//           )
//           const initialReceiverBalance = await ethers.provider.getBalance(
//             fundReceiverAddress
//           )

//           await this.contract
//             .connect(this.creator)
//             .withdrawFunds(fundReceiverAddress)

//           const updatedContractBalance = await ethers.provider.getBalance(
//             this.contract.address
//           )
//           const updatedReceiverBalance = await ethers.provider.getBalance(
//             fundReceiverAddress
//           )

//           expect(updatedContractBalance).to.be.equal(0)
//           expect(updatedReceiverBalance).to.be.equal(
//             initialReceiverBalance.add(initialContractBalance)
//           )
//         })
//       })
//     })
//   })
// })
