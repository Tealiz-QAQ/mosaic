import { getSwapDataFromArgs, SwapArgs } from '@mosaic-ag/ts-sdk'
import { useAptosWallet } from '@razorlabs/wallet-kit'
import { useCallback, useMemo, useState } from 'react'
import useRefreshBalanceFn from './useRefreshBalanceFn'
import useSwapNotificationFn from './useSwapNotificationFn'
import { Ed25519PublicKey } from '@aptos-labs/ts-sdk'
import invariant from 'invariant'
import { aptos } from '../constants'
import ReactGA from 'react-ga4'
import { sleep } from '../utils/time.ts'

export interface SwapState {
  isSwapping: boolean
  txHash: string | undefined
  success: boolean | undefined
}

export default function useSwap() {
  const [{ isSwapping, txHash, success }, setSwapState] = useState<SwapState>({
    isSwapping: false,
    txHash: undefined,
    success: undefined,
  })
  const { account, signAndSubmitTransaction } = useAptosWallet()

  const sendNotification = useSwapNotificationFn()
  const refreshBalance = useRefreshBalanceFn()

  const onSwap = useCallback(
    async (args: SwapArgs) => {
      if (!account || isSwapping) return

      try {
        setSwapState({ isSwapping: true, txHash: undefined, success: undefined })

        // 1. Build transaction.
        const swapData = getSwapDataFromArgs(args)
        const transaction = await aptos.transaction.build.simple({
          sender: account.address,
          data: {
            function: swapData.function,
            functionArguments: swapData.functionArguments,
            typeArguments: swapData.typeArguments,
          },
        })

        // 2. Simulate transaction.
        const simulateResponses = await aptos.transaction.simulate.simple({
          signerPublicKey: new Ed25519PublicKey(account.publicKey),
          transaction,
        })
        invariant(simulateResponses.length === 1, 'simulateResponse length should be 1')
        const simulateResponse = simulateResponses[0]
        invariant(simulateResponse.success, simulateResponse.vm_status)

        // 3. Submit transaction.
        const submitResponse = await signAndSubmitTransaction({ payload: swapData })

        // 4. Get submitted transaction hash.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
        invariant(submitResponse.status === 'Approved', 'submitResponse.status REJECTED')
        const hash = submitResponse.args.hash

        // 5. Evaluate transaction status.
        // const receipt = await aptos.waitForTransaction({ transactionHash: hash })
        // invariant(receipt.success, receipt.vm_status)

        // 6. Send notification.
        setSwapState({ isSwapping: false, txHash: hash, success: true })
        sendNotification(args.tokenIn, args.tokenOut, args.amountIn, args.amountOut, hash, true, '')
        ReactGA.event({
          category: 'swap',
          action: 'swap_success',
          label: '',
          value: 1,
          nonInteraction: true,
          transport: 'beacon',
        })
      } catch (err) {
        console.error(err)
        setSwapState((prev) => ({ ...prev, isSwapping: false }))

        const jsonErr = JSON.stringify(err)
        if (jsonErr !== `{"code":"WALLET.SIGN_TX_ERROR"}`) {
          let errorDetails: string | undefined
          if (typeof err === 'string') {
            errorDetails = err
          } else {
            errorDetails = (err as any)?.message || undefined
          }
          sendNotification(args.tokenIn, args.tokenOut, args.amountIn, args.amountOut, undefined, false, errorDetails)
          ReactGA.event({
            category: 'swap',
            action: 'swap_error',
            label: errorDetails,
            value: 0,
            nonInteraction: true,
            transport: 'beacon',
          })
        }
      } finally {
        // Need setTimeout this because suzuka testnet is fucking slow.
        await sleep(4000)
        void refreshBalance()
      }
    },
    [account, isSwapping, refreshBalance, sendNotification, signAndSubmitTransaction],
  )

  const res = useMemo(
    () => ({
      isSwapping,
      txHash,
      success,
      onSwap,
    }),
    [isSwapping, onSwap, success, txHash],
  )
  return res
}
