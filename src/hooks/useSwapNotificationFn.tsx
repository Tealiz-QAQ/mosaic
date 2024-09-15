import { Link } from '@nextui-org/react'
import { useCallback } from 'react'
import { isDesktop } from 'react-device-detect'
import { toast } from 'react-toastify'
import { BodyB2, TitleT2, TitleT4 } from '../components/Texts'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { ITransactionHistory, addTransactionHistory } from '../redux/slices/user'
import { divpowToFraction } from '../utils/number'

export default function useSwapNotificationFn() {
  const dispatch = useAppDispatch()
  const { followingTokenData } = useAppSelector((state) => state.token)

  const sendNotification = useCallback(
    (
      tokenIn: string,
      tokenOut: string,
      amountIn: string,
      amountOut: string,
      txHash: string | undefined,
      isSuccess: boolean,
      details: string | undefined,
    ) => {
      const tokenInData = followingTokenData[tokenIn]
      const tokenOutData = followingTokenData[tokenOut]
      if (tokenInData && tokenOutData) {
        const payload: ITransactionHistory = {
          txHash: txHash,
          isSuccess,
          details,
          tokenInSymbol: tokenInData.symbol,
          tokenOutSymbol: tokenOutData.symbol,
          readableAmountIn: divpowToFraction(amountIn, tokenInData.decimals).toSignificant(6),
          readableAmountOut: divpowToFraction(amountOut, tokenOutData.decimals).toSignificant(6),
          timestamp: Date.now(),
          tokenInAddress: tokenInData.id,
          tokenOutAddress: tokenOutData.id,
        }
        dispatch(addTransactionHistory(payload))
        toast(
          payload.isSuccess ? (
            <div className="rounded bg-[rgba(24,207,106,0.2)] p-4">
              <TitleT2>
                Swap {payload.readableAmountIn} {payload.tokenInSymbol} to {payload.readableAmountOut}{' '}
                {payload.tokenOutSymbol}
              </TitleT2>
              {payload.txHash && (
                <Link
                  href={`https://explorer.movementnetwork.xyz/txn/${txHash}?network=testnet`}
                  isExternal
                  showAnchorIcon
                  className="text-light2"
                >
                  <TitleT4>View on explorer</TitleT4>
                </Link>
              )}
            </div>
          ) : (
            <div className="rounded bg-[rgba(244,70,70,0.2)] p-4">
              <TitleT2>
                Error swapping {payload.readableAmountIn} {payload.tokenInSymbol} to {payload.readableAmountOut}{' '}
                {payload.tokenOutSymbol}
              </TitleT2>
              {payload.txHash && (
                <Link
                  href={`https://explorer.movementnetwork.xyz/txn/${payload.txHash}?network=testnet`}
                  isExternal
                  showAnchorIcon
                  className="text-light2"
                >
                  <TitleT4>View on explorer</TitleT4>
                </Link>
              )}
              {details && <BodyB2>{details}</BodyB2>}
            </div>
          ),
          {
            className: 'z-toast',
            bodyClassName: 'z-toast-body',
            progressClassName: payload.isSuccess ? 'z-toast-progress-success' : 'z-toast-progress-failed',
            autoClose: payload.isSuccess || isDesktop ? 4000 : false,
            pauseOnHover: isDesktop,
            position: "top-right"
          },
        )
      }
    },
    [dispatch, followingTokenData],
  )
  return sendNotification
}
