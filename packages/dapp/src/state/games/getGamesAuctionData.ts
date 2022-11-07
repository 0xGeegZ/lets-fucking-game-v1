import { SerializedGame } from 'state/types'

const getGamesAuctionData = (games: SerializedGame[], winnerGames: string[], auctionHostingEndDate: string) => {
  return games.map((game) => {
    const isAuctionWinnerGame = winnerGames.find(
      (winnerGame) => winnerGame.toLowerCase() === game.lpAddress.toLowerCase(),
    )
    return {
      ...game,
      ...(isAuctionWinnerGame && { isCommunity: true, auctionHostingEndDate }),
    }
  })
}

export default getGamesAuctionData
