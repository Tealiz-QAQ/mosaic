import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk'

export const MOVE = '0x1::aptos_coin::AptosCoin'
export const USDC = '0x275f508689de8756169d1ee02d889c777de1cebda3a7bbcce63ba8a27c563c6f::tokens::USDC'

export const NOT_FOUND_TOKEN_LOGO_URL =
  'https://png.pngtree.com/png-clipart/20190516/original/pngtree-question-mark-vector-icon-png-image_4236972.jpg'

export const ENV = import.meta.env.VITE_ENV
export const AGGREGATOR_URL = import.meta.env.VITE_AGGREGATOR_URL
export const VERSION = 14 // Pump version to purge state.

export const NODE_RPC_URL = 'https://aptos.testnet.suzuka.movementlabs.xyz'

const aptosConfig = new AptosConfig({ fullnode: 'https://aptos.testnet.suzuka.movementlabs.xyz/v1' })
export const aptos = new Aptos(aptosConfig)
