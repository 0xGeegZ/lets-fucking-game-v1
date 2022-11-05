// SPDX-License-Identifier: MIT
pragma solidity >=0.8.6;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import { CronUpkeepInterface } from "./interfaces/CronUpkeepInterface.sol";

import { Cron as CronExternal } from "@chainlink/contracts/src/v0.8/libraries/external/Cron.sol";
import { IKeeper } from "./interfaces/IKeeper.sol";

contract Keeper is IKeeper, Ownable, Pausable {
    using Address for address;

    address public cronUpkeep;
    bytes public encodedCron;

    uint256 private cronUpkeepJobId;

    constructor(address _cronUpkeep, string memory _encodedCron) {
        encodedCron = CronExternal.toEncodedSpec(_encodedCron);
        cronUpkeep = _cronUpkeep;

        uint256 nextCronJobIDs = CronUpkeepInterface(cronUpkeep).getNextCronJobIDs();
        cronUpkeepJobId = nextCronJobIDs;

        CronUpkeepInterface(cronUpkeep).createCronJobFromEncodedSpec(
            owner(),
            bytes("triggerDailyCheckpoint()"),
            encodedCron
        );
    }

    /**
     * @inheritdoc IKeeper
     */
    function setCronUpkeep(address _cronUpkeep) external override onlyOwner {
        cronUpkeep = _cronUpkeep;
        emit CronUpkeepUpdated(cronUpkeepJobId, cronUpkeep);

        uint256 nextCronJobIDs = CronUpkeepInterface(cronUpkeep).getNextCronJobIDs();
        cronUpkeepJobId = nextCronJobIDs;

        CronUpkeepInterface(cronUpkeep).createCronJobFromEncodedSpec(
            address(this),
            bytes("triggerDailyCheckpoint()"),
            encodedCron
        );
    }

    /**
     * @inheritdoc IKeeper
     */
    function setEncodedCron(string memory _encodedCron) external override onlyOwner {
        require(bytes(_encodedCron).length != 0, "Keeper cron need to be initialised");

        encodedCron = CronExternal.toEncodedSpec(_encodedCron);

        emit EncodedCronUpdated(cronUpkeepJobId, _encodedCron);

        CronUpkeepInterface(cronUpkeep).updateCronJob(
            cronUpkeepJobId,
            address(this),
            bytes("triggerDailyCheckpoint()"),
            encodedCron
        );
    }

    /**
     * @inheritdoc IKeeper
     */
    function pauseKeeper() external override whenNotPaused {
        CronUpkeepInterface(cronUpkeep).deleteCronJob(cronUpkeepJobId);
    }

    /**
     * @inheritdoc IKeeper
     */
    function unpauseKeeper() external override whenPaused onlyIfKeeperDataInit {
        uint256 nextCronJobIDs = CronUpkeepInterface(cronUpkeep).getNextCronJobIDs();
        cronUpkeepJobId = nextCronJobIDs;

        CronUpkeepInterface(cronUpkeep).createCronJobFromEncodedSpec(
            owner(),
            bytes("triggerDailyCheckpoint()"),
            encodedCron
        );
    }

    /**
     * @notice Modifier that ensure that keeper data are initialised
     */
    modifier onlyIfKeeperDataInit() {
        require(cronUpkeep != address(0), "Keeper need to be initialised");
        require(bytes(encodedCron).length != 0, "Keeper cron need to be initialised");
        _;
    }
}
