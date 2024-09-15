import useSWR from 'swr'
import { useMemo } from 'react'
import axios from 'axios'
import { NODE_RPC_URL } from '../constants'
import dayjs from 'dayjs'

export interface NetworkInformation {
  chain_id: number
  epoch: string
  ledger_version: string
  oldest_ledger_version: string
  ledger_timestamp: string
  node_role: string
  oldest_block_height: string
  block_height: string
  git_hash: string
}

const fn = async () => {
  const response = await axios<NetworkInformation>(`${NODE_RPC_URL}/v1`)
  if (response.status === 200) return response.data
  return undefined
}

export default function useMovementNetwork() {
  const { data, isValidating } = useSWR('useMovementNetwork', fn, { refreshInterval: 10_000 })

  return useMemo(() => {
    let isNetworkStable = false
    if (data) {
      const diff = dayjs().diff(dayjs(Number(data.ledger_timestamp) / 1000))
      isNetworkStable = diff <= 10_000
    }
    return {
      isNetworkStable,
      isLoadingNetworkStatus: isValidating,
    }
  }, [data, isValidating])
}
