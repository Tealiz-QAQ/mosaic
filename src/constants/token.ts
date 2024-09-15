export interface RawCoinInfo {
  id: string
  decimals: number
  name: string
  symbol: string
  logoUrl: string
}

export const MOSA: RawCoinInfo = {
  id: '0xe7d668e27e18fa54a50a6dac99e596f8bc2539ebfbf93e68700100dea2062b19::router::CoinMOSA',
  symbol: 'MOSA',
  name: 'MOSA',
  decimals: 8,
  logoUrl: 'https://app.mosaic.ag/images/mosa_icon.svg',
}

export const MOSB: RawCoinInfo = {
  id: '0xe7d668e27e18fa54a50a6dac99e596f8bc2539ebfbf93e68700100dea2062b19::router::MOSB',
  symbol: 'MOSB',
  name: 'MOSB',
  decimals: 8,
  logoUrl: 'https://app.mosaic.ag/images/mosb_icon.svg',
}

export const DEFAULT_TOKENS: RawCoinInfo[] = [
  {
    id: '0x1::aptos_coin::AptosCoin',
    symbol: 'MOVE',
    name: 'Movement Coin',
    decimals: 8,
    logoUrl: 'https://raw.githubusercontent.com/razorlabsorg/chainlist/main/chain/aptos/asset/MOVE.png',
  },
  {
    id: '0x275f508689de8756169d1ee02d889c777de1cebda3a7bbcce63ba8a27c563c6f::tokens::USDT',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoUrl: 'https://raw.githubusercontent.com/razorlabsorg/chainlist/main/chain/aptos/asset/USDT.png',
  },
  {
    id: '0x275f508689de8756169d1ee02d889c777de1cebda3a7bbcce63ba8a27c563c6f::tokens::USDC',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    logoUrl: 'https://raw.githubusercontent.com/razorlabsorg/chainlist/main/chain/aptos/asset/USDC.png',
  },
  {
    id: '0x275f508689de8756169d1ee02d889c777de1cebda3a7bbcce63ba8a27c563c6f::tokens::WETH',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 8,
    logoUrl: 'https://raw.githubusercontent.com/razorlabsorg/chainlist/main/chain/aptos/asset/WETH.png',
  },
  {
    id: '0x275f508689de8756169d1ee02d889c777de1cebda3a7bbcce63ba8a27c563c6f::tokens::WBTC',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    logoUrl: 'https://raw.githubusercontent.com/razorlabsorg/chainlist/main/chain/aptos/asset/WBTC.png',
  },
  {
    id: '0xcab9a7545a4f4a46308e2ac914a5ce2dcf63482713e683b4bc5fc4b514a790f2::Coins::SOL',
    symbol: 'SOL',
    name: 'Solana Coin',
    decimals: 8,
    logoUrl: 'https://raw.githubusercontent.com/razorlabsorg/chainlist/main/chain/aptos/asset/SOL.png',
  },
  {
    id: '0xcab9a7545a4f4a46308e2ac914a5ce2dcf63482713e683b4bc5fc4b514a790f2::razor_token::Razor',
    symbol: 'RZR',
    name: 'Razor Token',
    decimals: 8,
    logoUrl: 'https://raw.githubusercontent.com/razorlabsorg/chainlist/main/chain/aptos/asset/RZR.png',
  },
  {
    id: '0x8093e814c5cde1a2775750e999b3d9a01633fca54959126d890e87d95acbabca::staking::StakingToken',
    symbol: 'stMOVE',
    name: 'Staked Testnet Move',
    decimals: 8,
    logoUrl: 'https://raw.githubusercontent.com/razorlabsorg/chainlist/main/chain/aptos/asset/stMOVE.png',
  },
  {
    id: '0x76b759849ce0747635c5391705a63a97227dea883d61721d9128f627f99bf047::mosaic_token::Mosaic',
    symbol: 'MOS',
    name: 'Mosaic',
    decimals: 8,
    logoUrl: 'https://app.mosaic.ag/images/mos_icon.svg',
  },
  MOSA,
  MOSB,
]