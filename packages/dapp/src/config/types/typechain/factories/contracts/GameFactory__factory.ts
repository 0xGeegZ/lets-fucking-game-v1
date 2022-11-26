/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, BigNumberish, Overrides } from 'ethers'
import type { Provider, TransactionRequest } from '@ethersproject/providers'
import type { PromiseOrValue } from '../../common'
import type { GameFactory, GameFactoryInterface } from '../../contracts/GameFactory'

const _abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_game',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_cronUpkeep',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_gameCreationAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256[]',
        name: '_authorizedAmounts',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'cronUpkeep',
        type: 'address',
      },
    ],
    name: 'CronUpkeepUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'receiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'FailedTransfer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nextId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'gameAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'implementationVersion',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'creatorAddress',
        type: 'address',
      },
    ],
    name: 'GameCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Received',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Unpaused',
    type: 'event',
  },
  {
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    inputs: [
      {
        internalType: 'uint256[]',
        name: '_authorizedAmounts',
        type: 'uint256[]',
      },
    ],
    name: 'addAuthorizedAmounts',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'authorizedAmounts',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '_name',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: '_maxPlayers',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_playTimeRange',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_registrationAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_treasuryFee',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_creatorFee',
        type: 'uint256',
      },
      {
        internalType: 'string',
        name: '_encodedCron',
        type: 'string',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'position',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'standard',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'contractAddress',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'tokenId',
            type: 'uint256',
          },
        ],
        internalType: 'struct GameV1Interface.Prize[]',
        name: '_prizes',
        type: 'tuple[]',
      },
    ],
    name: 'createNewGame',
    outputs: [
      {
        internalType: 'address',
        name: 'game',
        type: 'address',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'cronUpkeep',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'deployedGames',
    outputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'versionId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'creator',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'deployedAddress',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'gameCreationAmount',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'gameCreationAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'games',
    outputs: [
      {
        internalType: 'uint256',
        name: 'id',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'deployedAddress',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_authorizedAmount',
        type: 'uint256',
      },
    ],
    name: 'getAuthorizedAmount',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'isUsed',
            type: 'bool',
          },
        ],
        internalType: 'struct GameFactory.AuthorizedAmount',
        name: 'gameAuthorisedAmount',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAuthorizedAmounts',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'gameAuthorisedAmounts',
        type: 'uint256[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getDeployedGames',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'id',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'versionId',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'creator',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'deployedAddress',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'gameCreationAmount',
            type: 'uint256',
          },
        ],
        internalType: 'struct GameFactory.Game[]',
        name: 'allGames',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestVersionId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'nextId',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pauseAllGamesAndFactory',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'resumeAllGamesAndFactory',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_game',
        type: 'address',
      },
    ],
    name: 'setNewGameV1',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_adminAddress',
        type: 'address',
      },
    ],
    name: 'transferAdminOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_cronUpkeep',
        type: 'address',
      },
    ],
    name: 'updateCronUpkeep',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'usedAuthorizedAmounts',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'isUsed',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawFunds',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    stateMutability: 'payable',
    type: 'receive',
  },
]

const _bytecode =
  '0x608060405260006003553480156200001657600080fd5b50604051620028e6380380620028e6833981016040819052620000399162000415565b6000805460ff191690556200004e3362000340565b6001808055815182911115620000c65760405162461bcd60e51b815260206004820152603260248201527f617574686f72697a6564416d6f756e74732073686f756c64206265206772656160448201527174686572206f7220657175616c20746f203160701b60648201526084015b60405180910390fd5b846001600160a01b0381166200011f5760405162461bcd60e51b815260206004820152601e60248201527f61646472657373206e65656420746f20626520696e697469616c6973656400006044820152606401620000bd565b846001600160a01b038116620001785760405162461bcd60e51b815260206004820152601e60248201527f61646472657373206e65656420746f20626520696e697469616c6973656400006044820152606401620000bd565b600280546001600160a01b038089166001600160a01b031992831617835560048890556040805180820190915260055481528a8216602082019081526006805460018101825560009182529251929095027ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d3f810192909255517ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d4090910180549190921692169190911790555b845181101562000332576200025b8582815181106200024757620002476200053f565b60200260200101516200039960201b60201c565b6200031d5760088582815181106200027757620002776200053f565b602090810291909101810151825460018101845560009384529190922001556040805180820190915285518190879084908110620002b957620002b96200053f565b602002602001015181526020016000151581525060096000878481518110620002e657620002e66200053f565b602090810291909101810151825281810192909252604001600020825181559101516001909101805460ff19169115159190911790555b80620003298162000515565b91505062000224565b50505050505050506200056b565b600080546001600160a01b03838116610100818102610100600160a81b0319851617855560405193049190911692909183917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a35050565b6000805b600854811015620003ef578260088281548110620003bf57620003bf6200053f565b90600052602060002001541415620003da5750600192915050565b80620003e68162000515565b9150506200039d565b50600092915050565b80516001600160a01b03811681146200041057600080fd5b919050565b600080600080608085870312156200042c57600080fd5b6200043785620003f8565b9350602062000448818701620003f8565b6040870151606088015191955093506001600160401b03808211156200046d57600080fd5b818801915088601f8301126200048257600080fd5b81518181111562000497576200049762000555565b8060051b604051601f19603f83011681018181108582111715620004bf57620004bf62000555565b604052828152858101935084860182860187018d1015620004df57600080fd5b600095505b8386101562000504578051855260019590950194938601938601620004e4565b50989b979a50959850505050505050565b60006000198214156200053857634e487b7160e01b600052601160045260246000fd5b5060010190565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052604160045260246000fd5b61236b806200057b6000396000f3fe60806040526004361061019a5760003560e01c80638456cb59116100e1578063ac5f50c81161008a578063ea8ac8cf11610064578063ea8ac8cf14610564578063eae81c371461057a578063f2fde38b1461059c578063fdd3d43d146105bc576101da565b8063ac5f50c8146104a7578063c1e6a4ce14610522578063d59d2efa14610544576101da565b8063953aef90116100bb578063953aef90146104545780639d73613d14610467578063a649beb214610487576101da565b80638456cb59146103fc57806388244f15146104115780638da5cb5b14610431576101da565b80634acb33a011610143578063657908d11161011d578063657908d11461037d57806367f98152146103d1578063715018a6146103e7576101da565b80634acb33a0146102fe5780635c975abb1461033657806361b8ce8c14610359576101da565b80633b7b617a116101745780633b7b617a146102885780633f4ba83a1461029d57806348308bd7146102b2576101da565b806308a80ff51461020f578063117a5b901461023157806324600fc314610273576101da565b366101da57604080513381523460208201527f88a5966d370b9919b20f3e2c13ff65706f196a4e32cc2c12bf57088f8852587491015b60405180910390a1005b604080513381523460208201527f88a5966d370b9919b20f3e2c13ff65706f196a4e32cc2c12bf57088f8852587491016101d0565b34801561021b57600080fd5b5061022f61022a366004611d8f565b6105d1565b005b34801561023d57600080fd5b5061025161024c366004611f3a565b6106ab565b604080519283526001600160a01b039091166020830152015b60405180910390f35b34801561027f57600080fd5b5061022f6106e2565b34801561029457600080fd5b5061022f610770565b3480156102a957600080fd5b5061022f6108e9565b3480156102be57600080fd5b506102e96102cd366004611f3a565b6009602052600090815260409020805460019091015460ff1682565b6040805192835290151560208301520161026a565b34801561030a57600080fd5b5060025461031e906001600160a01b031681565b6040516001600160a01b03909116815260200161026a565b34801561034257600080fd5b5060005460ff16604051901515815260200161026a565b34801561036557600080fd5b5061036f60035481565b60405190815260200161026a565b34801561038957600080fd5b5061039d610398366004611f3a565b61096a565b6040805195865260208601949094526001600160a01b0392831693850193909352166060830152608082015260a00161026a565b3480156103dd57600080fd5b5061036f60055481565b3480156103f357600080fd5b5061022f6109b8565b34801561040857600080fd5b5061022f6109ca565b34801561041d57600080fd5b5061022f61042c366004611db1565b610a4b565b34801561043d57600080fd5b5060005461010090046001600160a01b031661031e565b61031e610462366004611e49565b610bb4565b34801561047357600080fd5b5061022f610482366004611d8f565b61116a565b34801561049357600080fd5b5061036f6104a2366004611f3a565b61141c565b3480156104b357600080fd5b506105056104c2366004611f3a565b6040805180820190915260008082526020820152506000908152600960209081526040918290208251808401909352805483526001015460ff1615159082015290565b60408051825181526020928301511515928101929092520161026a565b34801561052e57600080fd5b5061053761143d565b60405161026a919061208a565b34801561055057600080fd5b5061022f61055f366004611d8f565b611495565b34801561057057600080fd5b5061036f60045481565b34801561058657600080fd5b5061058f6115cd565b60405161026a919061200e565b3480156105a857600080fd5b5061022f6105b7366004611d8f565b611666565b3480156105c857600080fd5b5061022f6116f3565b60005461010090046001600160a01b03166001600160a01b0316336001600160a01b0316146106475760405162461bcd60e51b815260206004820152601760248201527f43616c6c6572206973206e6f74207468652061646d696e00000000000000000060448201526064015b60405180910390fd5b806001600160a01b03811661069e5760405162461bcd60e51b815260206004820152601e60248201527f61646472657373206e65656420746f20626520696e697469616c697365640000604482015260640161063e565b6106a782611666565b5050565b600681815481106106bb57600080fd5b6000918252602090912060029091020180546001909101549091506001600160a01b031682565b60005461010090046001600160a01b03166001600160a01b0316336001600160a01b0316146107535760405162461bcd60e51b815260206004820152601760248201527f43616c6c6572206973206e6f74207468652061646d696e000000000000000000604482015260640161063e565b60005461076e9061010090046001600160a01b031647611869565b565b60005461010090046001600160a01b03166001600160a01b0316336001600160a01b0316146107e15760405162461bcd60e51b815260206004820152601760248201527f43616c6c6572206973206e6f74207468652061646d696e000000000000000000604482015260640161063e565b6107e96119a5565b6107f16119f8565b60005b6007548110156108e657600060078281548110610813576108136122d7565b600091825260208083206040805160a08101825260059094029091018054845260018101549284019290925260028201546001600160a01b039081168483015260038301541660608401819052600492830154608085015281517f8456cb59000000000000000000000000000000000000000000000000000000008152915193955093638456cb599382840193919290919082900301818387803b1580156108ba57600080fd5b505af11580156108ce573d6000803e3d6000fd5b505050505080806108de9061226f565b9150506107f4565b50565b60005461010090046001600160a01b03166001600160a01b0316336001600160a01b03161461095a5760405162461bcd60e51b815260206004820152601760248201527f43616c6c6572206973206e6f74207468652061646d696e000000000000000000604482015260640161063e565b610962611a52565b61076e611aa4565b6007818154811061097a57600080fd5b60009182526020909120600590910201805460018201546002830154600384015460049094015492945090926001600160a01b039182169291169085565b6109c0611add565b61076e6000611b3d565b60005461010090046001600160a01b03166001600160a01b0316336001600160a01b031614610a3b5760405162461bcd60e51b815260206004820152601760248201527f43616c6c6572206973206e6f74207468652061646d696e000000000000000000604482015260640161063e565b610a436119a5565b61076e6119f8565b60005461010090046001600160a01b03166001600160a01b0316336001600160a01b031614610abc5760405162461bcd60e51b815260206004820152601760248201527f43616c6c6572206973206e6f74207468652061646d696e000000000000000000604482015260640161063e565b60005b81518110156106a757610aea828281518110610add57610add6122d7565b6020026020010151611bad565b610ba2576008828281518110610b0257610b026122d7565b602090810291909101810151825460018101845560009384529190922001556040805180820190915282518190849084908110610b4157610b416122d7565b602002602001015181526020016000151581525060096000848481518110610b6b57610b6b6122d7565b602090810291909101810151825281810192909252604001600020825181559101516001909101805460ff19169115159190911790555b80610bac8161226f565b915050610abf565b6000610bbe6119a5565b60005461010090046001600160a01b03166001600160a01b0316336001600160a01b03161480610bf057506004543410155b610c615760405162461bcd60e51b8152602060048201526024808201527f4f6e6c792067616d65206372656174696f6e20616d6f756e7420697320616c6c60448201527f6f77656400000000000000000000000000000000000000000000000000000000606482015260840161063e565b60008681526009602052604090205486908114610cc05760405162461bcd60e51b815260206004820181905260248201527f726567697374726174696f6e416d6f7574206973206e6f7420616c6c6f776564604482015260640161063e565b86801580610ce0575060008181526009602052604090206001015460ff16155b610d525760405162461bcd60e51b815260206004820152602160248201527f726567697374726174696f6e416d6f757420697320616c72656164792075736560448201527f6400000000000000000000000000000000000000000000000000000000000000606482015260840161063e565b6000600660055481548110610d6957610d696122d7565b600091825260208220600160029092020101546001600160a01b03169150610d9082611c04565b60008b81526009602090815260408083206001908101805460ff191682179055815160a081018352600354815260058054948201948552338285019081526001600160a01b03808916606085019081526004805460808701908152600780549889018155909a529451959093027fa66cc928b5edb82af9bd49922954155ab7b0942694bea4ce44661d9a8736c68881019590955595517fa66cc928b5edb82af9bd49922954155ab7b0942694bea4ce44661d9a8736c689850155517fa66cc928b5edb82af9bd49922954155ab7b0942694bea4ce44661d9a8736c68a840180549187167fffffffffffffffffffffffff000000000000000000000000000000000000000092831617905590517fa66cc928b5edb82af9bd49922954155ab7b0942694bea4ce44661d9a8736c68b840180549187169190921617905593517fa66cc928b5edb82af9bd49922954155ab7b0942694bea4ce44661d9a8736c68c9091015560025490517f21fb4c3500000000000000000000000000000000000000000000000000000000815293945016916321fb4c3591610f40918591016001600160a01b0391909116815260200190565b600060405180830381600087803b158015610f5a57600080fd5b505af1158015610f6e573d6000803e3d6000fd5b50505050610ffb604051806101a0016040528060006001600160a01b0316815260200160006001600160a01b0316815260200160006001600160a01b03168152602001600080191681526020016000815260200160008152602001600081526020016000815260200160008152602001600081526020016000815260200160608152602001606081525090565b33602082015260005461010090046001600160a01b03166001600160a01b039081168252600254166040820152606081018e9052600554608082015260035460a082015260c081018c905260e081018d905261010081018b905261012081018a90526101408101899052610160810188905261018081018790526004546000906110859034612258565b9050826001600160a01b0316639647487f82846040518363ffffffff1660e01b81526004016110b491906120ce565b6000604051808303818588803b1580156110cd57600080fd5b505af11580156110e1573d6000803e3d6000fd5b5050600354600554604080519283526001600160a01b03891660208401528201523360608201527fc94e0e39f6c88eefe2da1019ef63fcd57321af4dde03fbe73dadb0275cb06152935060800191506111379050565b60405180910390a16001600360008282546111529190612240565b90915550929f9e505050505050505050505050505050565b60005461010090046001600160a01b03166001600160a01b0316336001600160a01b0316146111db5760405162461bcd60e51b815260206004820152601760248201527f43616c6c6572206973206e6f74207468652061646d696e000000000000000000604482015260640161063e565b806001600160a01b0381166112325760405162461bcd60e51b815260206004820152601e60248201527f61646472657373206e65656420746f20626520696e697469616c697365640000604482015260640161063e565b600280547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0384169081179091556040519081527fab6a2d4263b3d387f97d78a01e517495e0f6cd26f6d0ecbb9899d6c3922a4f769060200160405180910390a160005b600754811015611417576000600782815481106112bd576112bd6122d7565b60009182526020918290206040805160a081018252600593909302909101805483526001810154938301939093526002808401546001600160a01b039081168484015260038501548116606085018190526004958601546080860152915492517f21fb4c350000000000000000000000000000000000000000000000000000000081529485019190915291935016906321fb4c3590602401600060405180830381600087803b15801561136f57600080fd5b505af1158015611383573d6000803e3d6000fd5b5050505060608101516002546040517fa0dd526f0000000000000000000000000000000000000000000000000000000081526001600160a01b03918216600482015291169063a0dd526f90602401600060405180830381600087803b1580156113eb57600080fd5b505af11580156113ff573d6000803e3d6000fd5b5050505050808061140f9061226f565b91505061129e565b505050565b6008818154811061142c57600080fd5b600091825260209091200154905081565b6060600880548060200260200160405190810160405280929190818152602001828054801561148b57602002820191906000526020600020905b815481526020019060010190808311611477575b5050505050905090565b60005461010090046001600160a01b03166001600160a01b0316336001600160a01b0316146115065760405162461bcd60e51b815260206004820152601760248201527f43616c6c6572206973206e6f74207468652061646d696e000000000000000000604482015260640161063e565b6001600560008282546115199190612240565b90915550506040805180820190915260055481526001600160a01b03918216602082019081526006805460018101825560009190915291517ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d3f600290930292830155517ff652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377c0d4090910180547fffffffffffffffffffffffff00000000000000000000000000000000000000001691909216179055565b60606007805480602002602001604051908101604052809291908181526020016000905b8282101561165d5760008481526020908190206040805160a08101825260058602909201805483526001808201548486015260028201546001600160a01b03908116938501939093526003820154909216606084015260040154608083015290835290920191016115f1565b50505050905090565b61166e611add565b6001600160a01b0381166116ea5760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201527f6464726573730000000000000000000000000000000000000000000000000000606482015260840161063e565b6108e681611b3d565b60005461010090046001600160a01b03166001600160a01b0316336001600160a01b0316146117645760405162461bcd60e51b815260206004820152601760248201527f43616c6c6572206973206e6f74207468652061646d696e000000000000000000604482015260640161063e565b61176c611a52565b611774611aa4565b60005b6007548110156108e657600060078281548110611796576117966122d7565b600091825260208083206040805160a08101825260059094029091018054845260018101549284019290925260028201546001600160a01b039081168483015260038301541660608401819052600492830154608085015281517f3f4ba83a000000000000000000000000000000000000000000000000000000008152915193955093633f4ba83a9382840193919290919082900301818387803b15801561183d57600080fd5b505af1158015611851573d6000803e3d6000fd5b505050505080806118619061226f565b915050611777565b47818110156118ba5760405162461bcd60e51b815260206004820152601e60248201527f4e6f7420656e6f75676820696e20636f6e74726163742062616c616e63650000604482015260640161063e565b6000836001600160a01b03168360405160006040518083038185875af1925050503d8060008114611907576040519150601f19603f3d011682016040523d82523d6000602084013e61190c565b606091505b505090508061199f57604080516001600160a01b0386168152602081018590527f3506b32cea6b36a739c1c2a71a9e1b3d6222104389c07219059fa6eb6d2e0563910160405180910390a160405162461bcd60e51b815260206004820152601060248201527f5472616e73666572206661696c65642e00000000000000000000000000000000604482015260640161063e565b50505050565b60005460ff161561076e5760405162461bcd60e51b815260206004820152601060248201527f5061757361626c653a2070617573656400000000000000000000000000000000604482015260640161063e565b611a006119a5565b6000805460ff191660011790557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258611a353390565b6040516001600160a01b03909116815260200160405180910390a1565b60005460ff1661076e5760405162461bcd60e51b815260206004820152601460248201527f5061757361626c653a206e6f7420706175736564000000000000000000000000604482015260640161063e565b611aac611a52565b6000805460ff191690557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa33611a35565b6000546001600160a01b0361010090910416331461076e5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015260640161063e565b600080546001600160a01b038381166101008181027fffffffffffffffffffffff0000000000000000000000000000000000000000ff851617855560405193049190911692909183917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a35050565b6000805b600854811015611bfb578260088281548110611bcf57611bcf6122d7565b90600052602060002001541415611be95750600192915050565b80611bf38161226f565b915050611bb1565b50600092915050565b60006040517f3d602d80600a3d3981f3363d3d373d3d3d363d7300000000000000000000000081528260601b60148201527f5af43d82803e903d91602b57fd5bf3000000000000000000000000000000000060288201526037816000f09150506001600160a01b038116611cba5760405162461bcd60e51b815260206004820152601660248201527f455243313136373a20637265617465206661696c656400000000000000000000604482015260640161063e565b919050565b80356001600160a01b0381168114611cba57600080fd5b600082601f830112611ce757600080fd5b81356020611cfc611cf78361221c565b6121eb565b8281528181019085830160a080860288018501891015611d1b57600080fd5b6000805b87811015611d805782848c031215611d35578182fd5b611d3d6121c2565b843581528785013588820152604080860135908201526060611d60818701611cbf565b908201526080858101359082015286529486019492820192600101611d1f565b50929998505050505050505050565b600060208284031215611da157600080fd5b611daa82611cbf565b9392505050565b60006020808385031215611dc457600080fd5b823567ffffffffffffffff811115611ddb57600080fd5b8301601f81018513611dec57600080fd5b8035611dfa611cf78261221c565b80828252848201915084840188868560051b8701011115611e1a57600080fd5b600094505b83851015611e3d578035835260019490940193918501918501611e1f565b50979650505050505050565b600080600080600080600080610100898b031215611e6657600080fd5b883597506020808a0135975060408a0135965060608a0135955060808a0135945060a08a0135935060c08a013567ffffffffffffffff80821115611ea957600080fd5b818c0191508c601f830112611ebd57600080fd5b813581811115611ecf57611ecf612306565b611ee184601f19601f840116016121eb565b8181528e85838601011115611ef557600080fd5b818585018683013760009181019094015291935060e08b01359180831115611f1c57600080fd5b5050611f2a8b828c01611cd6565b9150509295985092959890939650565b600060208284031215611f4c57600080fd5b5035919050565b600081518084526020808501945080840160005b83811015611fb6578151805188528381015184890152604080820151908901526060808201516001600160a01b0316908901526080908101519088015260a09096019590820190600101611f67565b509495945050505050565b6000815180845260005b81811015611fe757602081850181015186830182015201611fcb565b81811115611ff9576000602083870101525b50601f01601f19169290920160200192915050565b602080825282518282018190526000919060409081850190868401855b8281101561207d578151805185528681015187860152858101516001600160a01b0390811687870152606080830151909116908601526080908101519085015260a0909301929085019060010161202b565b5091979650505050505050565b6020808252825182820181905260009190848201906040850190845b818110156120c2578351835292840192918401916001016120a6565b50909695505050505050565b602081526120e86020820183516001600160a01b03169052565b6000602083015161210460408401826001600160a01b03169052565b5060408301516001600160a01b03811660608401525060608301516080830152608083015160a083015260a083015160c083015260c083015160e083015260e08301516101008181850152808501519150506101208181850152808501519150506101408181850152808501519150506101608181850152808501519150506101a0610180818186015261219c6101c0860184611fc1565b90860151858203601f1901838701529092506121b88382611f53565b9695505050505050565b60405160a0810167ffffffffffffffff811182821017156121e5576121e5612306565b60405290565b604051601f8201601f1916810167ffffffffffffffff8111828210171561221457612214612306565b604052919050565b600067ffffffffffffffff82111561223657612236612306565b5060051b60200190565b60008219821115612253576122536122a8565b500190565b60008282101561226a5761226a6122a8565b500390565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8214156122a1576122a16122a8565b5060010190565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fdfea26469706673582212208e75cf738ec23d84b9689c5d4feeb0f34a98527601553b9fdafdabf2c865d17c64736f6c63430008060033'

type GameFactoryConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>

const isSuperArgs = (xs: GameFactoryConstructorParams): xs is ConstructorParameters<typeof ContractFactory> =>
  xs.length > 1

export class GameFactory__factory extends ContractFactory {
  constructor(...args: GameFactoryConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args)
    } else {
      super(_abi, _bytecode, args[0])
    }
  }

  override deploy(
    _game: PromiseOrValue<string>,
    _cronUpkeep: PromiseOrValue<string>,
    _gameCreationAmount: PromiseOrValue<BigNumberish>,
    _authorizedAmounts: PromiseOrValue<BigNumberish>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): Promise<GameFactory> {
    return super.deploy(
      _game,
      _cronUpkeep,
      _gameCreationAmount,
      _authorizedAmounts,
      overrides || {},
    ) as Promise<GameFactory>
  }
  override getDeployTransaction(
    _game: PromiseOrValue<string>,
    _cronUpkeep: PromiseOrValue<string>,
    _gameCreationAmount: PromiseOrValue<BigNumberish>,
    _authorizedAmounts: PromiseOrValue<BigNumberish>[],
    overrides?: Overrides & { from?: PromiseOrValue<string> },
  ): TransactionRequest {
    return super.getDeployTransaction(_game, _cronUpkeep, _gameCreationAmount, _authorizedAmounts, overrides || {})
  }
  override attach(address: string): GameFactory {
    return super.attach(address) as GameFactory
  }
  override connect(signer: Signer): GameFactory__factory {
    return super.connect(signer) as GameFactory__factory
  }

  static readonly bytecode = _bytecode
  static readonly abi = _abi
  static createInterface(): GameFactoryInterface {
    return new utils.Interface(_abi) as GameFactoryInterface
  }
  static connect(address: string, signerOrProvider: Signer | Provider): GameFactory {
    return new Contract(address, _abi, signerOrProvider) as GameFactory
  }
}
