// SPDX-License-Identifier: MIT
pragma solidity >=0.8.6;

interface IKeeper {
    /**
     * @notice Called when the creator or admin update encodedCron
     */
    event EncodedCronUpdated(uint256 jobId, string encodedCron);
    /**
     * @notice Called when the factory or admin update cronUpkeep
     */
    event CronUpkeepUpdated(uint256 jobId, address cronUpkeep);

    /**
     * @notice Set the keeper address
     * @param _cronUpkeep the new keeper address
     * @dev Callable by admin or factory
     */
    function setCronUpkeep(address _cronUpkeep) external;

    /**
     * @notice Set the encoded cron
     * @param _encodedCron the new encoded cron as * * * * *
     * @dev Callable by admin or creator
     */
    function setEncodedCron(string memory _encodedCron) external;

    /**
     * @notice Pause the current keeper and associated keeper job
     * @dev Callable by admin or creator
     */
    function pauseKeeper() external;

    /**
     * @notice Unpause the current keeper and associated keeper job
     * @dev Callable by admin or creator
     */
    function unpauseKeeper() external;
}
