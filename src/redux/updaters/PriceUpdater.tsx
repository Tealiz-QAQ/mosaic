import { memo, useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks'
import { updatePriceData } from '../slices/price'
import { AGGREGATOR_URL } from '../../constants'
import axios from 'axios'
import useSWR from 'swr'
import { PartialRecord } from '../../types'

interface GetTokenPriceResponse {
  code: number
  message: string
  data: GetTokenPriceResponseData
  requestId: string
}

interface GetTokenPriceResponseData {
  priceById: PartialRecord<string, TokenPrice>
}

interface TokenPrice {
  id: string
  price: string
  poolTvl: string
  poolId: string
  preferPoolId: string
  updatedAt: number
}

const fn = async ({ tokens }: { key: string; tokens: string[] }) => {
  if (!tokens) return
  const url = `${AGGREGATOR_URL}/v1/prices?` + tokens.map((t) => `ids[]=${t}`).join('&')
  const response = await axios<GetTokenPriceResponse>(url)
  if (response.status === 200) {
    return response.data
  }
  return undefined
}

function useTokenPrice(tokens: string[]) {
  const {
    data: response,
    error,
    isValidating,
  } = useSWR({ key: 'useTokenPrice', tokens }, fn, {
    refreshInterval: 60_000,
  })

  const res = useMemo(
    () => ({
      isValidating,
      error,
      tokenPriceMap: response?.data.priceById,
    }),
    [error, isValidating, response?.data.priceById],
  )

  return res
}

function PriceUpdater() {
  const dispatch = useAppDispatch()

  const followingTokenAddresses = useAppSelector((state) => state.token.followingTokenAddresses)

  const { tokenPriceMap } = useTokenPrice(followingTokenAddresses)
  useEffect(() => {
    if (tokenPriceMap) {
      const newPriceData: PartialRecord<string, string> = {}
      for (const address of Object.keys(tokenPriceMap)) {
        newPriceData[address] = tokenPriceMap[address]!.price
      }
      dispatch(updatePriceData(newPriceData))
    }
  }, [dispatch, tokenPriceMap])

  return null
}

const MemoPriceUpdater = memo(PriceUpdater)
export default MemoPriceUpdater
