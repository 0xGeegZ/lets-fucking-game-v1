/**
 * Helper to sort games
 */
export const sortGamesDefault = (a, b) => {
  // sort game where user is playing first
  if (a.userData.isPlaying && b.userData.isPlaying) {
    // sort game where player has not lost first
    if (a.playerData.hasLost && b.playerData.hasLost) return 0
    if (a.playerData.hasLost) return 1
    if (b.playerData.hasLost) return -1

    // sort game currently in progress first
    if (a.isInProgress && b.isInProgress) {
      // sort game with less remaining players count
      if (a.remainingPlayersCount === b.remainingPlayersCount) return 0
      if (a.remainingPlayersCount < b.remainingPlayersCount) return -1
      return 1
    }
    if (a.isInProgress) return -1
    if (b.isInProgress) return 1
    return 0
  }

  if (a.userData.isPlaying) return -1
  if (b.userData.isPlaying) return 1

  if (a.isInProgress && b.isInProgress) {
    if (a.remainingPlayersCount === b.remainingPlayersCount) return 0
    if (a.remainingPlayersCount < b.remainingPlayersCount) return -1
    return 1
  }
  if (a.isInProgress) return -1
  if (b.isInProgress) return 1

  // sorting game paused last
  if (a.isPaused && b.isPaused) return 0
  if (a.isPaused) return 1
  if (b.isPaused) return -1

  if (a.playerAddressesCount && b.playerAddressesCount) return 0
  if (a.playerAddressesCount) return -1
  if (b.playerAddressesCount) return 1

  if (a.remainingPlayersCount && b.remainingPlayersCount) return 0
  if (a.remainingPlayersCount) return -1
  if (b.remainingPlayersCount) return 1

  return 0
}

export const sortGamesLaunching = (a, b) => {
  if (a.isPaused && b.isPaused) return 0
  if (a.isPaused) return 1
  if (b.isPaused) return -1

  if (a.isInProgress && b.isInProgress) return 0
  if (a.isInProgress) return 1
  if (b.isInProgress) return -1

  if (a.playerAddressesCount && b.playerAddressesCount) return 0
  if (a.playerAddressesCount) return -1
  if (b.playerAddressesCount) return 1

  // if (a.remainingPlayersCount && b.remainingPlayersCount) return 0
  // if (a.remainingPlayersCount) return -1
  // if (b.remainingPlayersCount) return 1

  return 0
}
