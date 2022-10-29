// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/proxy/Proxy.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/KeeperBase.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

import { Cron as CronInternal, Spec } from "@chainlink/contracts/src/v0.8/libraries/internal/Cron.sol";
import { Cron as CronExternal } from "@chainlink/contracts/src/v0.8/libraries/external/Cron.sol";

import { getRevertMsg } from "@chainlink/contracts/src/v0.8/utils/utils.sol";

/**
  The Cron contract is a chainlink keepers-powered cron job runner for smart contracts.
  The contract enables developers to trigger actions on various targets using cron
  strings to specify the cadence. For example, a user may have 3 tasks that require
  regular service in their dapp ecosystem:
    1) 0xAB..CD, update(1), "0 0 * * *"     --> runs update(1) on 0xAB..CD daily at midnight
    2) 0xAB..CD, update(2), "30 12 * * 0-4" --> runs update(2) on 0xAB..CD weekdays at 12:30
    3) 0x12..34, trigger(), "0 * * * *"     --> runs trigger() on 0x12..34 hourly
  To use this contract, a user first deploys this contract and registers it on the chainlink
  keeper registry. Then the user adds cron jobs by following these steps:
    1) Convert a cron string to an encoded cron spec by calling encodeCronString()
    2) Take the encoding, target, and handler, and create a job by sending a tx to createCronJob()
    3) Cron job is running :)
*/

interface CronUpkeepInterface {
    event CronJobExecuted(uint256 indexed id, uint256 timestamp);
    event CronJobCreated(uint256 indexed id, address target, bytes handler);
    event CronJobUpdated(uint256 indexed id, address target, bytes handler);
    event CronJobDeleted(uint256 indexed id);

    /**
     * @notice Executes the cron job with id encoded in performData
     * @param performData abi encoding of cron job ID and the cron job's next run-at datetime
     */
    function performUpkeep(bytes calldata performData) external;

    /**
     * @notice Creates a cron job from the given encoded spec
     * @param target the destination contract of a cron job
     * @param handler the function signature on the target contract to call
     * @param encodedCronSpec abi encoding of a cron spec
     */
    function createCronJobFromEncodedSpec(
        address target,
        bytes memory handler,
        bytes memory encodedCronSpec
    ) external;

    /**
     * @notice Updates a cron job from the given encoded spec
     * @param id the id of the cron job to update
     * @param newTarget the destination contract of a cron job
     * @param newHandler the function signature on the target contract to call
     * @param newEncodedCronSpec abi encoding of a cron spec
     */
    function updateCronJob(
        uint256 id,
        address newTarget,
        bytes memory newHandler,
        bytes memory newEncodedCronSpec
    ) external;

    /**
     * @notice Deletes the cron job matching the provided id. Reverts if
     * the id is not found.
     * @param id the id of the cron job to delete
     */
    function deleteCronJob(uint256 id) external;

    /**
     * @notice Add a delegator to the smart contract.
     * @param delegator the address of delegator to add
     */
    function addDelegator(address delegator) external;

    /**
     * @notice Remove a delegator to the smart contract.
     * @param delegator the address of delegator to remove
     */
    function removeDelegator(address delegator) external;

    /**
     * @notice Pauses the contract, which prevents executing performUpkeep
     */
    function pause() external;

    /**
     * @notice Unpauses the contract
     */
    function unpause() external;

    /**
     * @notice Get the id of an eligible cron job
     * @return upkeepNeeded signals if upkeep is needed, performData is an abi encoding
     * of the id and "next tick" of the elligible cron job
     */
    function checkUpkeep(bytes calldata) external returns (bool, bytes memory);

    /**
     * @notice gets a list of active cron job IDs
     * @return list of active cron job IDs
     */
    function getActiveCronJobIDs() external view returns (uint256[] memory);

    /**
     * @notice gets the next cron job IDs
     * @return next cron job IDs
     */
    function getNextCronJobIDs() external view returns (uint256);

    /**
   * @notice gets a cron job
   * @param id the cron job ID
   * @return target - the address a cron job forwards the eth tx to
             handler - the encoded function sig to execute when forwarding a tx
             cronString - the string representing the cron job
             nextTick - the timestamp of the next time the cron job will run
   */
    function getCronJob(uint256 id)
        external
        view
        returns (
            address target,
            bytes memory handler,
            string memory cronString,
            uint256 nextTick
        );
}
