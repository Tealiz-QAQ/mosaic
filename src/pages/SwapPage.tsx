import { Icon } from '@iconify/react'
import { Button, Image, Skeleton, Spacer } from '@nextui-org/react'
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { NumericFormat } from 'react-number-format'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useDebounceValue } from 'usehooks-ts'
import { ArrowFilledDownIcon, ChevronRight, SettingIcon, SwapIcon, WalletIcon } from '../components/Icons.tsx'
import { BodyB2, TitleL3, TitleT1, TitleT4 } from '../components/Texts.tsx'
import ModalConnectWallet from '../../src/components/modals/ModalConnectWallet.tsx'
import { useAptosWallet } from '@razorlabs/wallet-kit'
import CountdownSpinner from '../components/CountdownSpinner.tsx'
import { MOVE, NOT_FOUND_TOKEN_LOGO_URL, USDC } from '../constants'
import { SOURCES } from '../constants/source.ts'
import useFullTokens, { TokenInfo } from '../hooks/useFullTokens.ts'
import useQuote from '../hooks/useQuote.ts'
import useSwap from '../hooks/useSwap.tsx'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { addTokensToFollow, Token } from '../redux/slices/token.ts'
import { Fraction } from '../utils/fraction.ts'
import {
  divpowToFraction,
  escapeRegExp,
  inputRegex,
  mulpowToFraction,
  numberWithCommas,
  truncateValue,
} from '../utils/number.ts'
import { BIP_BASE } from '@mosaic-ag/ts-sdk'
import useMovementNetwork from '../hooks/useMovementNetwork.ts'
import ModalSelectToken from '../components/modals/ModalSelectToken.tsx'
import ModalUserSetting from '../components/modals/ModalUserSetting.tsx'
import ModalTradeRoute from '../components/modals/ModalTradeRoute.tsx'
import { ModalContext } from '../components/modals/ModalContextProvider.tsx'
import { MODAL_LIST } from '../components/modals/constant.ts'
import { MOSA } from '../constants/token.ts'
import { useCountUp } from 'react-countup'

export default function SwapPage() {
  const { globalModal, isModalOpen, onOpenModal, onCloseModal, onOpenChangeModal } = useContext(ModalContext)

  const [isWalletModalOpen, setWalletModalOpen] = useState(false)
  const handleOpenWalletModal = () => {
    setWalletModalOpen(true)
  }

  const handleCloseWalletModal = () => {
    setWalletModalOpen(false)
  }

  const dispatch = useAppDispatch()

  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const resetTimerFunction = useRef(() => { })
  const setResetTimerFunc = (f: () => void) => (resetTimerFunction.current = f)

  const { balance } = useAppSelector((state) => state.wallet)

  const { isNetworkStable, isLoadingNetworkStatus } = useMovementNetwork()

  const { account, connected: _connected, disconnect } = useAptosWallet()
  const connected = account?.address && _connected

  // Need this because razor extension is stupid.
  useEffect(() => {
    if (_connected && !account?.address) {
      void disconnect()
    }
  }, [_connected, account, disconnect])

  const [typedAmountIn, _setTypedAmountIn] = useState('1')
  const [shouldUseDebounceAmountIn, setShouldUseDebounceAmountIn] = useState(true)
  const setTypedAmountIn = useCallback((value: string, decimals = 8, shouldUseDebounce = true) => {
    setShouldUseDebounceAmountIn(shouldUseDebounce)
    if (value?.endsWith(',')) {
      value = value.slice(0, value.length - 1) + '.'
    }
    value = value.replaceAll(',', '')
    if (value === '' || inputRegex.test(escapeRegExp(value))) {
      value = truncateValue(value, decimals)
      if (value.length && value.startsWith('.')) value = '0.'
      value = numberWithCommas(value)
      _setTypedAmountIn(value)
    }
  }, [])

  const followingTokenData = useAppSelector((state) => state.token.followingTokenData)
  const tokenIn = useMemo(
    () =>
      (Object.values(followingTokenData) as Token[]).find((token) => {
        try {
          const tokenSymbolOrAddress = location.pathname.replace('/swap/', '').split('-')[0]
          return token.symbol === tokenSymbolOrAddress || token.id === tokenSymbolOrAddress
        } catch {
          return false
        }
      })?.id || MOVE,
    [followingTokenData, location.pathname],
  )
  const tokenOut = useMemo(
    () =>
      (Object.values(followingTokenData) as Token[]).find((token) => {
        try {
          const tokenSymbolOrAddress = location.pathname.replace('/swap/', '').split('-')[1]
          return token.symbol === tokenSymbolOrAddress || token.id === tokenSymbolOrAddress
        } catch {
          return false
        }
      })?.id || USDC,
    [followingTokenData, location.pathname],
  )
  const tokenInInfo: Token | undefined = useMemo(() => followingTokenData[tokenIn], [followingTokenData, tokenIn])
  const tokenOutInfo: Token | undefined = useMemo(() => followingTokenData[tokenOut], [followingTokenData, tokenOut])

  const { data: fullTokenData } = useFullTokens()
  useEffect(() => {
    const pair = location.pathname.replace('/swap/', '')
    try {
      const tokenInSymbolOrAddress = pair.split('-')[0]
      const tokenOutSymbolOrAddress = pair.split('-')[1]
      if (!tokenInSymbolOrAddress || !tokenOutSymbolOrAddress) throw new Error(`invalid pair = ${pair}`)

      const followingTokenDataList = Object.values(followingTokenData) as Token[]

      if (!fullTokenData || Object.values(fullTokenData).length === 0) return
      const fullTokenDataList = Object.values(fullTokenData) as TokenInfo[]

      const newTokenIn =
        fullTokenDataList.find((token) => token.id === tokenInSymbolOrAddress) ||
        followingTokenDataList.find((token) => token.symbol === tokenInSymbolOrAddress)
      const newTokenOut =
        fullTokenDataList.find((token) => token.id === tokenOutSymbolOrAddress) ||
        followingTokenDataList.find((token) => token.symbol === tokenOutSymbolOrAddress)
      if (!newTokenIn) throw new Error(`cannot find tokenIn = ${tokenInSymbolOrAddress}`)
      if (!newTokenOut) throw new Error(`cannot find tokenOut = ${tokenOutSymbolOrAddress}`)
      dispatch(addTokensToFollow([newTokenIn.id, newTokenOut.id]))
    } catch (err) {
      pair !== '/swap' && console.error(err)
      navigate(`/swap/MOVE-USDC?${params.toString()}`, { replace: true })
    }
  }, [dispatch, followingTokenData, fullTokenData, location.pathname, navigate, params])

  const _setTokenIn = useCallback(
    (symbolOrAddress: string) => {
      const pair = location.pathname.replace('/swap/', '')
      try {
        const tokenInSymbolOrAddress = pair.split('-')[0]
        const tokenOutSymbolOrAddress = pair.split('-')[1]
        if (!tokenInSymbolOrAddress || !tokenOutSymbolOrAddress) throw new Error(`invalid pair = ${pair}`)
        navigate(`/swap/${symbolOrAddress}-${tokenOutSymbolOrAddress}?${params.toString()}`, { replace: true })
      } catch (err) {
        pair !== '/swap' && console.error(err)
        navigate(`/swap/MOVE-USDC?${params.toString()}`, { replace: true })
      }
    },
    [location.pathname, navigate, params],
  )
  const _setTokenOut = useCallback(
    (symbolOrAddress: string) => {
      const pair = location.pathname.replace('/swap/', '')
      try {
        const tokenInSymbolOrAddress = pair.split('-')[0]
        const tokenOutSymbolOrAddress = pair.split('-')[1]
        if (!tokenInSymbolOrAddress || !tokenOutSymbolOrAddress) throw new Error(`invalid pair = ${pair}`)
        navigate(`/swap/${tokenInSymbolOrAddress}-${symbolOrAddress}?${params.toString()}`, { replace: true })
      } catch (err) {
        pair !== '/swap' && console.error(err)
        navigate(`/swap/MOVE-USDC?${params.toString()}`, { replace: true })
      }
    },
    [location.pathname, navigate, params],
  )

  const tokenInDecimals = tokenInInfo ? tokenInInfo.decimals : undefined
  const tokenOutDecimals = tokenOutInfo ? tokenOutInfo.decimals : undefined

  const followingPriceData = useAppSelector((state) => state.price.followingPriceData)
  const fractionalPriceTokenIn = useMemo(
    () => (followingPriceData[tokenIn] ? mulpowToFraction(followingPriceData[tokenIn]) : undefined),
    [followingPriceData, tokenIn],
  )
  const fractionalPriceTokenOut = useMemo(
    () => (followingPriceData[tokenOut] ? mulpowToFraction(followingPriceData[tokenOut]) : undefined),
    [followingPriceData, tokenOut],
  )

  const balanceTokenIn = balance[tokenIn]
  const fractionalBalanceTokenIn = useMemo(
    () =>
      balanceTokenIn && tokenInDecimals !== undefined ? divpowToFraction(balanceTokenIn, tokenInDecimals) : undefined,
    [balanceTokenIn, tokenInDecimals],
  )
  const balanceTokenOut = balance[tokenOut]
  const fractionalBalanceTokenOut = useMemo(
    () =>
      balanceTokenOut && tokenOutDecimals !== undefined
        ? divpowToFraction(balanceTokenOut, tokenOutDecimals)
        : undefined,
    [balanceTokenOut, tokenOutDecimals],
  )

  const _fractionalAmountIn = useMemo(
    () =>
      typedAmountIn && tokenInDecimals !== undefined
        ? mulpowToFraction(typedAmountIn.replaceAll(',', ''), tokenInDecimals)
        : undefined,
    [tokenInDecimals, typedAmountIn],
  )
  const [fractionalAmountIn] = useDebounceValue(_fractionalAmountIn, shouldUseDebounceAmountIn ? 250 : 0)

  const [source, setSource] = useState('')

  const {
    amountOut,
    isValidating: isValidatingQuote,
    sourceInfo,
    paths,
    reFetch,
  } = useQuote(tokenIn, tokenOut, fractionalAmountIn?.numerator?.toString(), source)
  const fractionalAmountOut = useMemo(
    () =>
      amountOut && tokenOutDecimals != undefined ? new Fraction(amountOut, Math.pow(10, tokenOutDecimals)) : undefined,
    [tokenOutDecimals, amountOut],
  )

  const readableAmountOut =
    fractionalAmountOut && tokenOutDecimals !== undefined
      ? numberWithCommas(truncateValue(fractionalAmountOut.toFixed(18), tokenOutDecimals))
      : ''

  const fractionalAmountInUsd = useMemo(
    () =>
      fractionalAmountIn && fractionalPriceTokenIn ? fractionalAmountIn.multiply(fractionalPriceTokenIn) : undefined,
    [fractionalAmountIn, fractionalPriceTokenIn],
  )
  const fractionalAmountOutUsd = useMemo(
    () =>
      fractionalAmountOut && fractionalPriceTokenOut
        ? fractionalAmountOut.multiply(fractionalPriceTokenOut)
        : undefined,
    [fractionalAmountOut, fractionalPriceTokenOut],
  )

  const rate = useMemo(
    () => (fractionalAmountIn && fractionalAmountOut ? fractionalAmountOut.divide(fractionalAmountIn) : undefined),
    [fractionalAmountIn, fractionalAmountOut],
  )
  const priceImpact = useMemo(() => {
    let res =
      fractionalAmountInUsd && fractionalAmountOutUsd
        ? fractionalAmountInUsd.subtract(fractionalAmountOutUsd).divide(fractionalAmountInUsd).multiply(100)
        : undefined
    if (res?.lessThan(0)) {
      res = new Fraction(0)
    }
    return res
  }, [fractionalAmountInUsd, fractionalAmountOutUsd])
  const isPriceImpactVeryHigh = useMemo(() => Boolean(priceImpact?.greaterThan(10)), [priceImpact])
  const isPriceImpactHigh = useMemo(() => Boolean(priceImpact?.greaterThan(5)), [priceImpact])

  const slippageBps = useAppSelector((state) => state.user.slippageBps)
  // const isHighSlippage = slippageBps >= 500
  const minimumReceived = useMemo(() => {
    if (!fractionalAmountOut) return undefined
    // If any tokens have more than 8 decimals, this assignment will break. I assume 8 is the max decimals in aptos chain? Never mind, I will use 18.
    const str = fractionalAmountOut
      .multiply(BIP_BASE - slippageBps)
      .divide(BIP_BASE)
      .toFixed(18)
    const res = mulpowToFraction(str, tokenOutDecimals) // To cut redundant decimals.
    return res
  }, [fractionalAmountOut, slippageBps, tokenOutDecimals])

  const [isInvert, setIsInvert] = useState(false)

  const fractionalFeeAmount = useMemo(() => (tokenIn === MOVE ? new Fraction(2, 1000) : new Fraction(0, 1)), [tokenIn])
  const isSufficientBalance =
    fractionalBalanceTokenIn && fractionalAmountIn
      ? fractionalBalanceTokenIn.subtract(fractionalFeeAmount).equalTo(fractionalAmountIn) ||
      fractionalBalanceTokenIn.subtract(fractionalFeeAmount).greaterThan(fractionalAmountIn)
      : undefined

  const onSetPercentAmountIn = (percent: number) => {
    if (fractionalBalanceTokenIn && fractionalFeeAmount) {
      let newTypedAmountIn = fractionalBalanceTokenIn.multiply(percent).divide(100)
      if (fractionalBalanceTokenIn.subtract(fractionalFeeAmount).lessThan(newTypedAmountIn)) {
        newTypedAmountIn = newTypedAmountIn.subtract(fractionalFeeAmount)
      }
      if (newTypedAmountIn.greaterThan(0)) {
        const newTypedAmountInStr = newTypedAmountIn.toFixed(18)
        setTypedAmountIn(newTypedAmountInStr, tokenInDecimals, false)
      } else {
        setTypedAmountIn('', tokenInDecimals, false)
      }
    } else {
      setTypedAmountIn('', tokenInDecimals, false)
    }
  }

  const swapButton = useMemo(() => {
    if (isLoadingNetworkStatus) return { isDisabled: true, text: 'Checking network status...' }
    if (!isNetworkStable) return { isDisabled: true, text: 'Network is not stable now' }
    if (!fractionalAmountIn) return { isDisabled: true, text: 'Enter an amount' }
    if (!isSufficientBalance) return { isDisabled: true, text: 'Insufficient balance' }
    if (isValidatingQuote) return { isDisabled: true, text: 'Getting quote...' }
    if (!fractionalAmountOut) return { isDisabled: true, text: 'Not found route' }
    return { isDisabled: false, text: 'Swap' }
  }, [
    isLoadingNetworkStatus,
    isNetworkStable,
    fractionalAmountIn,
    isSufficientBalance,
    isValidatingQuote,
    fractionalAmountOut,
  ])

  const [tokenInLogoSrc, setTokenInLogoSrc] = useState(tokenInInfo?.logoUrl || NOT_FOUND_TOKEN_LOGO_URL)
  const [tokenOutLogoSrc, setTokenOutLogoSrc] = useState(tokenOutInfo?.logoUrl || NOT_FOUND_TOKEN_LOGO_URL)
  useEffect(() => {
    setTokenInLogoSrc(tokenInInfo?.logoUrl || NOT_FOUND_TOKEN_LOGO_URL)
    setTokenOutLogoSrc(tokenOutInfo?.logoUrl || NOT_FOUND_TOKEN_LOGO_URL)
  }, [tokenInInfo?.logoUrl, tokenOutInfo?.logoUrl])

  const switchToken = useCallback(() => {
    if (fractionalAmountOut && tokenOutDecimals !== undefined) {
      setTypedAmountIn(truncateValue(fractionalAmountOut.toFixed(18), tokenOutDecimals), tokenOutDecimals, false)
    } else {
      setTypedAmountIn('')
    }
    const pair = location.pathname.replace('/swap/', '')
    try {
      const tokenInSymbolOrAddress = pair.split('-')[0]
      const tokenOutSymbolOrAddress = pair.split('-')[1]
      if (!tokenInSymbolOrAddress || !tokenOutSymbolOrAddress) throw new Error(`invalid pair = ${pair}`)
      navigate(`/swap/${tokenOutSymbolOrAddress}-${tokenInSymbolOrAddress}?${params.toString()}`, {
        replace: true,
      })
    } catch (err) {
      pair !== '/swap' && console.error(err)
      navigate(`/swap/MOVE-USDC?${params.toString()}`, { replace: true })
    }
  }, [fractionalAmountOut, location.pathname, navigate, params, setTypedAmountIn, tokenOutDecimals])

  const setTokenIn = useCallback(
    (symbolOrAddress: string) => {
      if (tokenOut === symbolOrAddress || (tokenOutInfo && tokenOutInfo.symbol === symbolOrAddress)) {
        switchToken()
      } else {
        _setTokenIn(symbolOrAddress)
      }
    },
    [_setTokenIn, switchToken, tokenOut, tokenOutInfo],
  )
  const setTokenOut = useCallback(
    (symbolOrAddress: string) => {
      if (tokenIn === symbolOrAddress || (tokenInInfo && tokenInInfo.symbol === symbolOrAddress)) {
        switchToken()
      } else {
        _setTokenOut(symbolOrAddress)
      }
    },
    [_setTokenOut, switchToken, tokenIn, tokenInInfo],
  )

  const { txHash, isSwapping, onSwap: _onSwap, success: isSwapSuccess } = useSwap()
  const onSwap = () => {
    if (account && fractionalAmountIn && fractionalAmountOut && minimumReceived && paths) {
      void _onSwap({
        tokenIn,
        tokenOut,
        amountIn: fractionalAmountIn.numerator.toString(),
        amountOut: fractionalAmountOut.numerator.toString(),
        amountInUsd: fractionalAmountInUsd?.toSignificant(18) || '0',
        amountOutUsd: fractionalAmountOutUsd?.toSignificant(18) || '0',
        minAmountOut: minimumReceived.numerator.toString(),
        paths,
        feeBps: 0,
        chargeFeeBy: 'token_in',
        feeRecipient: account.address,
      })
    }
  }

  const balanceMOSA = useMemo(() => divpowToFraction(balance[MOSA.id] || '0', MOSA.decimals), [balance])
  const balanceMOSANum = useMemo(() => Number(balanceMOSA.toSignificant(6)), [balanceMOSA])

  const isDebug = useMemo(() => params.get('debug') === 'true', [params])

  useEffect(() => {
    resetTimerFunction.current()
  }, [fractionalAmountIn, tokenIn, tokenOut, isValidatingQuote])

  const [_shakeMosaText, _setShakeMosaText] = useState(false)
  const shakeMosaText = _shakeMosaText && balanceMOSA.greaterThan(0)
  const setShakeMosaText = () => {
    _setShakeMosaText(true)
    setTimeout(() => _setShakeMosaText(false), 500)
  }

  const { start: startCountUp } = useCountUp({
    ref: 'balance_mosa',
    start: 0,
    end: balanceMOSANum,
    duration: 0.5,
    separator: ',',
    decimals: 0,
    suffix: ' MOSA',
    onStart: setShakeMosaText,
    onUpdate: setShakeMosaText,
  })

  useEffect(() => {
    startCountUp()
  }, [balanceMOSANum, startCountUp])

  const buttonMosaRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <main className="isolate flex flex-col">
        <div className="fixed top-0 h-full w-screen">
          <Image
            className="fixed bottom-[-7vw] left-[-7vw] h-[30vw] max-h-[479.67px] xl:h-[25vw]"
            src="/images/background_object_1.svg"
          />
          <Image
            className="fixed right-[-7vw] top-[73px] h-[30vw] max-h-[479.67px] xl:h-[25vw] lg:bottom-0 lg:top-[unset]"
            src="/images/background_object_2.svg"
          />
        </div>
        {isDebug && (
          <div className="absolute left-0 top-1/2 z-[1] w-[250px] -translate-y-1/2 border-1 border-red-500 p-4">
            <div>💡 Press cmd and click to multiple select source.</div>
            <a
              href={`https://explorer.movementnetwork.xyz/txn/${txHash}?network=testnet`}
              target="_blank"
              rel="noreferrer"
              className="break-all"
            >
              tx_version: {txHash ? `https://explorer.movementnetwork.xyz/txn/${txHash}?network=testnet` : '--'}
            </a>
            <div>tx_success: {isSwapSuccess === undefined ? '--' : isSwapSuccess ? 'true' : 'false'}</div>
            <div>
              <select
                className="h-[50vh] border-1 border-red-500"
                onChange={(e) =>
                  setSource(
                    [...e.currentTarget.options]
                      .filter((op) => op.selected)
                      .map((op) => op.value)
                      .join(','),
                  )
                }
                multiple
              >
                {Object.keys(SOURCES).map((source) => (
                  <option key={source}>{source}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div className="z-[1] mt-4 w-full p-4 pt-0">
          <div className="mx-auto flex max-w-[464px] flex-col">
            <div className="flex justify-end">
              <Button
                isIconOnly
                className={'h-[44px] w-[44px] min-w-min bg-transparent'}
                disableAnimation
                onPress={async () => {
                  if (!isValidatingQuote) await reFetch()
                }}
              >
                <CountdownSpinner
                  timeInSeconds={10}
                  onFinishCountdown={reFetch}
                  setResetTimerFunc={setResetTimerFunc}
                  isLoading={isValidatingQuote}
                  size={24}
                />
              </Button>
              <Button
                isIconOnly
                className="h-[44px] w-[44px] min-w-min bg-transparent"
                onPress={() => onOpenModal(MODAL_LIST.USER_SETTING)}
                disableAnimation
              >
                <SettingIcon size={44} color={'#8B8D91'} />
              </Button>
            </div>

            <Spacer y={4} />

            <div className="relative flex flex-col gap-1">
              {/* INPUT */}
              <>
                <div className="flex flex-col gap-2 rounded-lg bg-black2 p-3">
                  <div className="flex h-[24px] items-center justify-between">
                    <BodyB2 className="text-white">You&apos;re Paying</BodyB2>
                    {connected && (
                      <Button
                        className="flex h-fit w-fit min-w-fit items-center gap-1 bg-transparent p-0"
                        disableAnimation
                        disableRipple
                        onClick={() => onSetPercentAmountIn(100)}
                      >
                        <WalletIcon size={24} />
                        <BodyB2 className="text-ffffff70">
                          {fractionalBalanceTokenIn ? numberWithCommas(fractionalBalanceTokenIn.toSignificant(6)) : '0'}
                        </BodyB2>
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <NumericFormat
                      decimalSeparator="."
                      allowedDecimalSeparators={[',']}
                      thousandSeparator
                      inputMode="decimal"
                      autoComplete="off"
                      autoCorrect="off"
                      type="text"
                      placeholder="0.00"
                      minLength={1}
                      maxLength={30}
                      spellCheck="false"
                      className="w-full bg-transparent text-[36px] font-semibold outline-none placeholder:text-ffffff30"
                      pattern="^[0-9]*[.,]?[0-9]*$"
                      value={typedAmountIn}
                      allowNegative={false}
                      onChange={(e) => setTypedAmountIn(e.currentTarget.value, tokenInDecimals)}
                    />
                    <Button
                      className="flex h-[42px] w-fit min-w-fit items-center gap-2 bg-transparent p-2 transition"
                      disableAnimation
                      disableRipple
                      onPress={() => onOpenModal(MODAL_LIST.SELECT_TOKEN_IN)}
                    >
                      <Image
                        width={20}
                        height={20}
                        className="min-h-[20px] min-w-[20px]"
                        src={tokenInLogoSrc}
                        onError={() => setTokenInLogoSrc(NOT_FOUND_TOKEN_LOGO_URL)}
                      />
                      <TitleT1 className="whitespace-nowrap">{tokenInInfo?.symbol ?? '--'}</TitleT1>
                      <ArrowFilledDownIcon size={20} />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <BodyB2 className="text-light2">
                      {fractionalAmountInUsd
                        ? '~$' + numberWithCommas(fractionalAmountInUsd.toSignificant(6), false, 2)
                        : '--'}
                    </BodyB2>
                  </div>
                </div>
              </>
              <div className="absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2">
                <Button
                  isIconOnly
                  className="rounded-full border-4 border-[#252831] bg-[#33363F]"
                  onPress={switchToken}
                >
                  <SwapIcon size={24} color="#FFFFFF" />
                </Button>
              </div>
              {/* OUTPUT */}
              <>
                <div className="flex flex-col gap-2 rounded-lg bg-black2 p-3">
                  <div className="flex h-[24px] items-center justify-between">
                    <BodyB2 className="text-white">To Receive</BodyB2>
                    {connected && (
                      <Button
                        className="flex h-fit w-fit min-w-fit items-center gap-1 bg-transparent p-0 disabled:opacity-100"
                        disableAnimation
                        disableRipple
                        disabled
                        isDisabled
                      >
                        <WalletIcon size={24} />
                        <BodyB2 className="text-ffffff70">
                          {fractionalBalanceTokenOut
                            ? numberWithCommas(fractionalBalanceTokenOut.toSignificant(6))
                            : '0'}
                        </BodyB2>
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    {isValidatingQuote ? (
                      <div className="flex h-[54px] w-full items-center">
                        <Skeleton className="h-[38px] w-full rounded" />
                      </div>
                    ) : (
                      <NumericFormat
                        decimalSeparator="."
                        allowedDecimalSeparators={[',']}
                        thousandSeparator
                        inputMode="decimal"
                        autoComplete="off"
                        autoCorrect="off"
                        type="text"
                        placeholder="0.00"
                        minLength={1}
                        maxLength={30}
                        spellCheck="false"
                        className="w-full bg-transparent text-[36px] font-semibold outline-none placeholder:text-ffffff30"
                        pattern="^[0-9]*[.,]?[0-9]*$"
                        disabled
                        data-tooltip-id="tooltip-input-amount-out"
                        value={readableAmountOut}
                      />
                    )}
                    <Button
                      className="flex h-[42px] w-fit min-w-fit items-center gap-2 bg-transparent p-2 transition"
                      disableAnimation
                      disableRipple
                      onPress={() => onOpenModal(MODAL_LIST.SELECT_TOKEN_OUT)}
                    >
                      <Image
                        width={20}
                        height={20}
                        className="min-h-[20px] min-w-[20px]"
                        src={tokenOutLogoSrc}
                        onError={() => setTokenOutLogoSrc(NOT_FOUND_TOKEN_LOGO_URL)}
                      />
                      <TitleT1 className="whitespace-nowrap">{tokenOutInfo?.symbol ?? '--'}</TitleT1>
                      <ArrowFilledDownIcon size={20} />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center justify-between gap-1">
                      <BodyB2 className="text-light2">
                        {fractionalAmountOutUsd
                          ? '~$' + numberWithCommas(fractionalAmountOutUsd.toSignificant(6), false, 2)
                          : '--'}
                      </BodyB2>
                      {priceImpact && priceImpact.greaterThan(new Fraction(1, 100)) && (
                        <BodyB2
                          data-tooltip-id="tooltip-price-impact"
                          className={
                            isPriceImpactVeryHigh
                              ? 'text-buttonRed'
                              : isPriceImpactHigh
                                ? 'text-buttonYellow'
                                : 'text-light2'
                          }
                        >
                          ({`-${truncateValue(priceImpact.toSignificant(4), 2)}%`})
                        </BodyB2>
                      )}
                    </div>
                    {fractionalAmountIn && fractionalAmountOut && priceImpact === undefined ? (
                      <div className="flex items-center gap-1">
                        <Icon icon="ph:warning" fontSize={16} color="#F44646" />
                        <TitleT4 className="text-buttonRed">Can&apos;t calculate price impact</TitleT4>
                      </div>
                    ) : isPriceImpactVeryHigh ? (
                      <div className="flex items-center gap-1">
                        <Icon icon="ph:warning" fontSize={16} color="#F44646" />
                        <TitleT4 className="text-buttonRed">Price impact is very high</TitleT4>
                      </div>
                    ) : isPriceImpactHigh ? (
                      <div className="flex items-center gap-1">
                        <Icon icon="ph:warning" fontSize={16} color="#FF9901" />
                        <TitleT4 className="text-buttonYellow">Price impact is high</TitleT4>
                      </div>
                    ) : null}
                  </div>
                </div>
              </>
            </div>

            <Spacer y={4} />

            {connected ? (
              <Button
                className={
                  'h-[52px] rounded' +
                  ' ' +
                  ((fractionalAmountIn && fractionalAmountOut && !priceImpact) || isPriceImpactVeryHigh
                    ? 'bg-buttonRed'
                    : 'bg-primary')
                }
                isLoading={isSwapping}
                onPress={onSwap}
                isDisabled={swapButton.isDisabled}
              >
                <TitleL3 className="text-dark0">{swapButton.text}</TitleL3>
              </Button>
            ) : (
              <>
                <Button
                  className="h-[52px] w-full min-w-fit rounded-lg px-4 py-0 bg-[#faca20] text-[#2e3337] font-bold text-lg"
                  onPress={handleOpenWalletModal}
                >
                  Connect wallet
                </Button>
                <ModalConnectWallet isOpen={isWalletModalOpen} onClose={handleCloseWalletModal} onOpenChange={handleCloseWalletModal} />
              </>
            )}

            <Spacer y={4} />

            {fractionalAmountIn && fractionalAmountOut && (
              <>
                <div className="flex flex-col gap-2 rounded-lg border-1 border-[rgba(128,134,139,0.5)] p-3">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {isValidatingQuote ? (
                        <>
                          <div className="flex h-[20px] w-[150px] items-center">
                            <Skeleton className="h-[20px] w-full rounded" />
                          </div>
                        </>
                      ) : isInvert ? (
                        <Button
                          onPress={() => setIsInvert((prev) => !prev)}
                          variant="light"
                          className="m-0 h-fit gap-1 p-0 data-[hover]:bg-transparent"
                          disableAnimation
                          disableRipple
                        >
                          <BodyB2 className="overflow-hidden text-ellipsis whitespace-nowrap text-ffffff70">
                            {rate
                              ? `1 ${tokenOutInfo?.symbol ?? '--'} = ${numberWithCommas(rate.invert().toSignificant(6))} ${tokenInInfo?.symbol ?? '--'}`
                              : '--'}
                          </BodyB2>
                        </Button>
                      ) : (
                        <Button
                          onPress={() => setIsInvert((prev) => !prev)}
                          variant="light"
                          className="m-0 h-fit gap-1 p-0 data-[hover]:bg-transparent"
                          disableAnimation
                          disableRipple
                        >
                          <BodyB2 className="overflow-hidden text-ellipsis whitespace-nowrap text-ffffff70">
                            {rate
                              ? `1 ${tokenInInfo?.symbol ?? '--'} = ${numberWithCommas(rate.toSignificant(6))} ${tokenOutInfo?.symbol ?? '--'}`
                              : '--'}
                          </BodyB2>
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <BodyB2 className="text-light2">Minimum Received</BodyB2>
                      <Icon
                        icon="material-symbols:info-outline"
                        color="#9AA0A6"
                        tabIndex={0}
                        data-tooltip-id="tooltip-minimum-received"
                      />
                    </div>
                    {isValidatingQuote ? (
                      <>
                        <div className="flex h-[20px] w-[100px] items-center">
                          <Skeleton className="h-[20px] w-full rounded" />
                        </div>
                      </>
                    ) : (
                      <BodyB2 className="text-white">
                        {minimumReceived && tokenOutInfo
                          ? `${numberWithCommas(minimumReceived.toSignificant(6))} ${tokenOutInfo.symbol ?? '--'}`
                          : '--'}
                      </BodyB2>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <BodyB2 className="text-light2">Trade Route</BodyB2>
                    {isValidatingQuote ? (
                      <>
                        <div className="flex h-[20px] w-[100px] items-center">
                          <Skeleton className="h-[20px] w-full rounded" />
                        </div>
                      </>
                    ) : sourceInfo ? (
                      <Button
                        className="m-0 flex h-fit w-fit items-center gap-1 p-0 text-white data-[hover]:bg-transparent"
                        disableAnimation
                        variant="light"
                        onPress={() => onOpenModal(MODAL_LIST.TRADE_ROUTE)}
                      >
                        <BodyB2>
                          {sourceInfo.numberOfPaths} split
                          {sourceInfo.numberOfPaths >= 2 ? 's' : ''} & {sourceInfo.numberOfPools} hop
                          {sourceInfo.numberOfPools >= 2 ? 's' : ''}
                        </BodyB2>
                        <ChevronRight size={16} color="#ffffff" />
                      </Button>
                    ) : (
                      <BodyB2>--</BodyB2>
                    )}
                  </div>
                </div>
                <Spacer y={4} />
              </>
            )}
          </div>
          <div className="mx-auto flex w-screen max-w-[740px] flex-col items-center rounded-lg border-1 border-ffffff30 bg-[url('/images/the_olympian_fortune_bg.png')] bg-cover bg-center bg-no-repeat py-4 md:-ml-4 md:max-w-[100vw]">
            <div className="font-GreekFreak text-[70px] leading-none text-primary md:text-[48px] sm:text-[28px]">
              THE OLYMPIAN FORTUNE
            </div>
            <div className="text-center text-xs">
              For every swap, you will receive a random amount of MOSA, which can be used to exchange for lucky rolls
            </div>
            <div className="mb-3 mt-3 flex items-center gap-5 sm:gap-2">
              <Button
                className={
                  'flex h-[32px] min-h-fit min-w-fit items-center rounded-lg px-4 py-0 text-dark0 data-[disabled]:opacity-100 sm:gap-1 sm:px-2 ' +
                  '' +
                  (shakeMosaText ? 'shake' : '')
                }
                variant="solid"
                color="primary"
                ref={buttonMosaRef}
                isDisabled
              >
                <div className="sm:text-xs">Earned:</div>
                <div className="font-bold sm:text-xs">
                  <span id="balance_mosa"></span>
                </div>

                <Image src="/images/mosa_icon.svg" height={16} />
              </Button>
              <Button
                className="flex h-[32px] min-h-fit min-w-fit items-center gap-0 rounded-lg p-0 py-0 text-dark0"
                variant="bordered"
                color="primary"
                style={{ minWidth: buttonMosaRef.current ? buttonMosaRef.current.clientWidth + 'px' : 'fit-content' }}
                onPress={() => navigate('/spin')}
              >
                <div className="font-GreekFreak text-xl text-primary sm:text-sm">TRY YOUR LUCK</div>
                <Icon
                  icon="material-symbols:arrow-right-alt"
                  height={24}
                  color="#FACA20"
                  className="-mt-1 rounded-full"
                />
              </Button>
            </div>
          </div>
        </div>
      </main>
      <ModalSelectToken
        isOpen={globalModal === MODAL_LIST.SELECT_TOKEN_IN && isModalOpen}
        onOpenChange={onOpenChangeModal}
        onClose={onCloseModal}
        setToken={setTokenIn}
      />
      <ModalSelectToken
        isOpen={globalModal === MODAL_LIST.SELECT_TOKEN_OUT && isModalOpen}
        onOpenChange={onOpenChangeModal}
        onClose={onCloseModal}
        setToken={setTokenOut}
      />
      <ModalUserSetting
        isOpen={globalModal === MODAL_LIST.USER_SETTING && isModalOpen}
        onOpenChange={onOpenChangeModal}
        onClose={onCloseModal}
      />
      <ModalTradeRoute
        isOpen={globalModal === MODAL_LIST.TRADE_ROUTE && isModalOpen}
        onOpenChange={onOpenChangeModal}
        onClose={onCloseModal}
        srcCoinType={tokenIn}
        dstCoinType={tokenOut}
        readableAmountIn={numberWithCommas(typedAmountIn)}
        readableAmountOut={readableAmountOut}
        rawAmountIn={fractionalAmountIn?.numerator?.toString()}
        paths={paths}
      />
    </>
  )
}
