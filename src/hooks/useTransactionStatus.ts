// import axios from "axios"
// import { useMemo } from "react"
// import useSWR from "swr"

// export interface GetTransactionStatusResponse {

// }

// const fn = async ({ hash }: { key: string; hash: string }) => {
//   if (!hash) return
//   const url = `https://api.mainnet.aptoslabs.com/v1/transactions/by_hash/${hash}`
//   const response = await axios<GetTransactionStatusResponse>(url)
//   if (response.status === 200) {
//     return response.data
//   }
//   return undefined
// }

// export default function useTransactionStatus(hash: string) {
//   const {
//     data: response,
//     error,
//     isValidating,
//   } = useSWR({ key: "useTransactionStatus", hash }, fn)

//   const res = useMemo(
//     () => ({
//       isValidating,
//       error,
//       tokenPriceMap: response?.data.priceById,
//     }),
//     [error, isValidating, response?.data.priceById],
//   )

//   return res
// }
