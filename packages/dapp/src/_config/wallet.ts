import { useSelectedWallet, WalletConfigV2 } from '@pancakeswap/ui-wallets'
import { WalletFilledIcon } from '@pancakeswap/uikit'
import type { ExtendEthereum } from 'global'
import { isFirefox } from 'react-device-detect'
import { metaMaskConnector, walletConnectNoQrCodeConnector } from '../utils/wagmi'

export enum ConnectorNames {
  MetaMask = 'metaMask',
  Injected = 'injected',
  WalletConnect = 'walletConnect',
  BSC = 'bsc',
  Blocto = 'blocto',
  WalletLink = 'coinbaseWallet',
}

const delay = (t: number) => new Promise((resolve) => setTimeout(resolve, t))

const createQrCode = (chainId: number, connect) => async () => {
  connect({ connector: walletConnectNoQrCodeConnector, chainId })

  // wait for WalletConnect to setup in order to get the uri
  await delay(100)
  const { uri } = (await walletConnectNoQrCodeConnector.getProvider()).connector

  return uri
}

type ExtendedValue = {
  canSwitchChain?: boolean
  canWatchAsset?: boolean
}

const walletsConfig = ({
  chainId,
  connect,
}: {
  chainId: number
  connect: (connectorID: ConnectorNames) => void
}): WalletConfigV2<ConnectorNames, ExtendedValue>[] => {
  const qrCode = createQrCode(chainId, connect)
  return [
    {
      id: 'metamask',
      title: 'Metamask',
      icon: '/images/wallets/metamask.png',
      installed: typeof window !== 'undefined' && Boolean(window.ethereum?.isMetaMask) && metaMaskConnector.ready,
      connectorId: ConnectorNames.MetaMask,
      deepLink: 'https://metamask.app.link/dapp/pancakeswap.finance/',
      qrCode,
      downloadLink: 'https://metamask.app.link/dapp/pancakeswap.finance/',
    },
    {
      id: 'binance',
      title: 'Binance Wallet',
      icon: '/images/wallets/binance.png',
      installed: typeof window !== 'undefined' && Boolean(window.BinanceChain),
      connectorId: ConnectorNames.BSC,
      guide: {
        desktop: 'https://www.bnbchain.org/en/binance-wallet',
      },
      downloadLink: {
        desktop: isFirefox
          ? 'https://addons.mozilla.org/en-US/firefox/addon/binance-chain/?src=search'
          : 'https://chrome.google.com/webstore/detail/binance-wallet/fhbohimaelbohpjbbldcngcnapndodjp',
      },
      canWatchAsset: false,
    },
    {
      id: 'coinbase',
      title: 'Coinbase Wallet',
      icon: '/images/wallets/coinbase.png',
      connectorId: ConnectorNames.WalletLink,
    },
    {
      id: 'trust',
      title: 'Trust Wallet',
      icon: '/images/wallets/trust.png',
      connectorId: ConnectorNames.Injected,
      installed:
        typeof window !== 'undefined' &&
        !(window.ethereum as ExtendEthereum)?.isSafePal && // SafePal has isTrust flag
        (Boolean(window.ethereum?.isTrust) ||
          // @ts-ignore
          Boolean(window.ethereum?.isTrustWallet)),
      deepLink: 'https://link.trustwallet.com/open_url?coin_id=20000714&url=https://pancakeswap.finance/',
      downloadLink: {
        desktop: 'https://chrome.google.com/webstore/detail/trust-wallet/egjidjbpglichdcondbcbdnbeeppgdph/related',
      },
      qrCode,
    },
    {
      id: 'walletconnect',
      title: 'WalletConnect',
      icon: '/images/wallets/walletconnect.png',
      connectorId: ConnectorNames.WalletConnect,
      canSwitchChain: false,
    },
    {
      id: 'opera',
      title: 'Opera Wallet',
      icon: '/images/wallets/opera.png',
      connectorId: ConnectorNames.Injected,
      installed: typeof window !== 'undefined' && Boolean(window.ethereum?.isOpera),
      downloadLink: 'https://www.opera.com/crypto/next',
    },
    {
      id: 'brave',
      title: 'Brave Wallet',
      icon: '/images/wallets/brave.png',
      connectorId: ConnectorNames.Injected,
      installed: typeof window !== 'undefined' && Boolean(window.ethereum?.isBraveWallet),
    },
    {
      id: 'math',
      title: 'MathWallet',
      icon: '/images/wallets/mathwallet.png',
      connectorId: ConnectorNames.Injected,
      installed: typeof window !== 'undefined' && Boolean(window.ethereum?.isMathWallet),
      qrCode,
      canSwitchChain: false,
    },
    {
      id: 'tokenpocket',
      title: 'TokenPocket',
      icon: '/images/wallets/tokenpocket.png',
      connectorId: ConnectorNames.Injected,
      installed: typeof window !== 'undefined' && Boolean(window.ethereum?.isTokenPocket),
      qrCode,
    },
    {
      id: 'safepal',
      title: 'SafePal',
      icon: '/images/wallets/safepal.png',
      connectorId: ConnectorNames.Injected,
      installed: typeof window !== 'undefined' && Boolean((window.ethereum as ExtendEthereum)?.isSafePal),
      qrCode,
      canSwitchChain: false,
      canWatchAsset: false,
    },
    {
      id: 'coin98',
      title: 'Coin98',
      icon: '/images/wallets/coin98.png',
      connectorId: ConnectorNames.Injected,
      installed:
        typeof window !== 'undefined' &&
        (Boolean((window.ethereum as ExtendEthereum)?.isCoin98) || Boolean(window.coin98)),
      qrCode,
    },
    {
      id: 'blocto',
      title: 'Blocto',
      icon: '/images/wallets/blocto.png',
      connectorId: ConnectorNames.Injected,
      installed: typeof window !== 'undefined' && Boolean((window.ethereum as ExtendEthereum)?.isBlocto),
      qrCode,
    },
  ]
}

export const createWallets = (chainId: number, connect: any) => {
  const hasInjected = typeof window !== 'undefined' && !window.ethereum
  const config = walletsConfig({ chainId, connect })
  return hasInjected && config.some((c) => c.installed && c.connectorId === ConnectorNames.Injected)
    ? config // add injected icon if none of injected type wallets installed
    : [
        ...config,
        {
          id: 'injected',
          title: 'Injected',
          icon: WalletFilledIcon,
          connectorId: ConnectorNames.Injected,
          installed: typeof window !== 'undefined' && Boolean(window.ethereum),
        },
      ]
}

export function useWalletCanWatchAsset() {
  const [selected] = useSelectedWallet<ConnectorNames, ExtendedValue>()
  return selected && selected.canWatchAsset !== false
}

export function useWalletCanSwitchChain() {
  const [selected] = useSelectedWallet<ConnectorNames, ExtendedValue>()
  return selected ? selected.canSwitchChain !== false : true
}
