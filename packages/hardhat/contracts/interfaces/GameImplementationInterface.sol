// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/utils/Address.sol";

import { CronUpkeepInterface } from "./CronUpkeepInterface.sol";
import { Cron as CronExternal } from "@chainlink/contracts/src/v0.8/libraries/external/Cron.sol";

interface GameImplementationInterface {
    /**
     * @notice Player structure that contain all usefull data for a player
     */
    struct Player {
        address playerAddress;
        uint256 roundRangeLowerLimit;
        uint256 roundRangeUpperLimit;
        bool hasPlayedRound;
        uint256 roundCount;
        bool hasLost;
        bool isSplitOk;
    }

    /**
     * @notice WinnerPlayerData structure that contain all usefull data for a winner
     */
    struct WinnerPlayerData {
        uint256 roundId;
        address playerAddress;
        uint256 amountWon;
        bool prizeClaimed;
    }

    /**
     * @notice Winner structure that contain a list of winner for a current roundId
     */
    struct Winner {
        address[] gameWinnerAddresses;
        mapping(address => WinnerPlayerData) gameWinners;
    }

    /**
     * @notice Initialization structure that contain all the data that are needed to create a new game
     */
    struct Initialization {
        address _owner;
        address _creator;
        address _cronUpkeep;
        uint256 _gameImplementationVersion;
        uint256 _gameId;
        uint256 _playTimeRange;
        uint256 _maxPlayers;
        uint256 _registrationAmount;
        uint256 _houseEdge;
        uint256 _creatorEdge;
        string _encodedCron;
    }

    ///EVENTS
    /**
     * @notice Called when a player has registered for a game
     */
    event RegisteredForGame(address playerAddress, uint256 playersCount);
    /**
     * @notice Called when the keeper start the game
     */
    event StartedGame(uint256 timelock, uint256 playersCount);
    /**
     * @notice Called when the keeper reset the game
     */
    event ResetGame(uint256 timelock, uint256 resetGameId);
    /**
     * @notice Called when a player lost a game
     */
    event GameLost(uint256 roundId, address playerAddress, uint256 roundCount);
    /**
     * @notice Called when a player play a round
     */
    event PlayedRound(address playerAddress);
    /**
     * @notice Called when a player won the game
     */
    event GameWon(uint256 roundId, address playerAddress, uint256 amountWon);
    /**
     * @notice Called when some player(s) split the game
     */
    event GameSplitted(uint256 roundId, address playerAddress, uint256 amountWon);
    /**
     * @notice Called when a player vote to split pot
     */
    event VoteToSplitPot(uint256 roundId, address playerAddress);
    /**
     * @notice Called when a transfert have failed
     */
    event FailedTransfer(address receiver, uint256 amount);
    /**
     * @notice Called when the contract have receive funds via receive() or fallback() function
     */
    event Received(address sender, uint256 amount);
    /**
     * @notice Called when a player have claimed his prize
     */
    event GamePrizeClaimed(address claimer, uint256 roundId, uint256 amountClaimed);

    /**
     * @notice Called when the creator or admin update Keeper
     */
    // event UpkeepUpdated(address cronUpkeep, string encodedCron, uint256 jobId);

    /**
     * @notice Called when the creator or admin update encodedCron
     */
    event EncodedCronUpdated(uint256 jobId, string encodedCron);
    /**
     * @notice Called when the factory or admin update cronUpkeep
     */
    event CronUpkeepUpdated(uint256 jobId, address cronUpkeep);

    /**
     * @notice Create a new Game Implementation by cloning the base contract
     * @param initialization the initialisation data with params as follow :
     *  @param initialization._creator the game creator
     *  @param initialization._owner the general admin address
     *  @param initialization._cronUpkeep the cron upkeep address
     *  @param initialization._gameImplementationVersion the version of the game implementation
     *  @param initialization._gameId the unique game id (fix)
     *  @param initialization._playTimeRange the time range during which a player can play in hour
     *  @param initialization._maxPlayers the maximum number of players for a game
     *  @param initialization._registrationAmount the amount that players will need to pay to enter in the game
     *  @param initialization._houseEdge the house edge in percent
     *  @param initialization._creatorEdge creator edge in percent
     *  @param initialization._encodedCron the cron string
     */
    function initialize(Initialization calldata initialization) external;

    /**
     * @notice Function that is called by the keeper when game is ready to start
     */
    function startGame() external;

    ///
    /// MAIN FUNCTIONS
    ///
    /**
     * @notice Function that allow players to register for a game
     */
    function registerForGame() external payable;

    /**
     * @notice Function that allow players to play for the current round
     */
    function playRound() external;

    /**
     * @notice Function that is called by the keeper based on the keeper cron
     */
    function triggerDailyCheckpoint() external;

    /**
     * @notice Function that allow player to vote to split pot
     * Only callable if less than 50% of the players remain
     */
    function voteToSplitPot() external;

    /**
     * @notice Function that is called by a winner to claim his prize
     */
    function claimPrize(uint256 _roundId) external;

    /// ADMIN FUNCTIONS
    /**
     * @notice Allow admin to withdraw his Edge
     */
    function withdrawAdminEdge() external;

    /// ADMIN FUNCTIONS
    /**
     * @notice set house edge for game
     * @param _houseEdge the new house edge
     */
    function setHouseEdge(uint256 _houseEdge) external;

    /**
     * @notice Allow admin or factory to update keeper address
     * @param _cronUpkeep the new keeper address
     */
    function setCronUpkeep(address _cronUpkeep) external;

    /**
     * @notice Allow admin or creator to update keeper cron
     * @param _encodedCron the new cron
     */
    function setEncodedCron(string memory _encodedCron) external;

    ///
    /// SETTERS FUNCTIONS
    ///

    /**
     * @notice Set the name of the game
     * @param _gameName the new game name
     */
    function setGameName(string calldata _gameName) external;

    /**
     * @notice Set the image of the game
     * @param _gameImage the new game image
     */
    function setGameImage(string calldata _gameImage) external;

    /**
     * @notice Set the maximum allowed players for the game
     * @param _maxPlayers the new max players limit
     */
    function setMaxPlayers(uint256 _maxPlayers) external;

    /**
     * @notice Allow creator to withdraw his Edge
     */
    function withdrawCreatorEdge() external;

    /**
     * @notice Pause the current game and associated keeper job
     */
    function pause() external;

    /**
     * @notice Unpause the current game and associated keeper job
     */
    function unpause() external;

    ///
    /// GETTERS FUNCTIONS
    ///

    /**
     * @notice Return game informations
     */
    function getStatus()
        external
        view
        returns (
            address,
            uint256,
            string memory,
            string memory,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256,
            bool,
            bool
        );

    /**
     * @notice Return the players addresses for the current game
     * @return list of players addresses
     */
    function getPlayerAddresses() external view returns (address[] memory);

    /**
     * @notice Return a player for the current game
     * @param player the player address
     * @return player if finded
     */
    function getPlayer(address player) external view returns (Player memory);

    /**
     * @notice Return the winners for a round id
     * @param _roundId the round id
     * @return list of WinnerPlayerData
     */
    function getWinners(uint256 _roundId) external view returns (WinnerPlayerData[] memory);

    /**
     * @notice Check if all remaining players are ok to split pot
     * @return true if all remaining players are ok to split pot, false otherwise
     */
    function isAllPlayersSplitOk() external view returns (bool);

    /**
     * @notice Get the number of remaining players for the current game
     * @return the number of remaining players for the current game
     */
    function getRemainingPlayersCount() external view returns (uint256);

    ///
    /// EMERGENCY
    ///
    /**
     * @notice Allow admin to withdraw all funds for smart contract
     * @param receiver the receiver for the funds
     */
    function withdrawFunds(address receiver) external;

    ///
    /// FALLBACK FUNCTIONS
    ///

    /**
     * @notice  Called for empty calldata (and any value)
     */
    receive() external payable;

    /**
     * @notice Called when no other function matches (not even the receive function). Optionally payable
     */
    fallback() external payable;
}
