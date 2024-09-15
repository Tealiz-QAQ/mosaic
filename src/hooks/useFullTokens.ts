import axios from 'axios'
import { useMemo } from 'react'
import useSWR from 'swr'
import { AGGREGATOR_URL } from '../constants'
import { PartialRecord } from '../types'

export interface TokenInfo {
  id: string
  decimals: number
  name: string
  symbol: string
}

interface GetTokenInfoResponseData {
  tokenById: PartialRecord<string, TokenInfo>
  nextCursor: number
}

interface GetTokenInfoResponse {
  code: number
  message: string
  data: GetTokenInfoResponseData
  requestId: string
}

const CHUNK_SIZE = 1e4

const fn = async () => {
  let cursor = 0
  let data: PartialRecord<string, TokenInfo> = {}
  while (true) {
    const url = `${AGGREGATOR_URL}/v1/tokens?count=${CHUNK_SIZE}&cursor=${cursor}`
    const response = await axios<GetTokenInfoResponse>(url)
    if (response.status === 200) {
      data = { ...data, ...response.data.data.tokenById }
      if (response.data.data.nextCursor) {
        cursor = response.data.data.nextCursor
        continue
      }
      break
    }
  }
  return data
}

export default function useFullTokens() {
  const { data, error, isValidating } = useSWR({ key: 'useFullTokens' }, fn, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnMount: true,
    revalidateOnReconnect: false,
  })

  const res = useMemo(
    () => ({
      isValidating,
      error,
      data,
    }),
    [data, error, isValidating],
  )

  return res
}
