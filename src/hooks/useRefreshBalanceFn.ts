import { useAptosWallet } from '@razorlabs/wallet-kit'
import axios from 'axios'
import { useCallback } from 'react'
import { NODE_RPC_URL } from '../constants'
import { useAppDispatch } from '../redux/hooks'
import { addTokensToFollow } from '../redux/slices/token'
import { updateBalance, WalletBalance } from '../redux/slices/wallet'

export interface GetAccountCoinResourceResponse {
  type: string
  data: {
    coin: {
      value: string
    }
  }
}

export default function useRefreshBalanceFn() {
  const dispatch = useAppDispatch()
  const { address } = useAptosWallet()

  const fn = useCallback(async () => {
    if (!address) return
    try {
      const response = await axios<GetAccountCoinResourceResponse[]>(`${NODE_RPC_URL}/v1/accounts/${address}/resources`)
      if (response.status !== 200) return
      const accountCoinsData: WalletBalance = {}
      response.data.forEach((item) => {
        if (item.type.startsWith('0x1::coin::CoinStore')) {
          const matches = item.type.match(/0x1::coin::CoinStore<(.*)>/)
          if (!matches || matches.length !== 2) return
          const coinType = matches[1]
          if (item.data.coin.value != '0') {
            accountCoinsData[coinType] = item.data.coin.value
          }
        }
      })

      dispatch(updateBalance(accountCoinsData))
      dispatch(addTokensToFollow(Object.keys(accountCoinsData).map((coinType) => coinType)))
    } catch (err) {
      console.error(err)
    }
  }, [address, dispatch])

  return fn
}
