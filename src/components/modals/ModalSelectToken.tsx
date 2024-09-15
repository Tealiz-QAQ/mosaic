import { Button, Input, Modal, ModalContent, Spacer } from '@nextui-org/react'
import { CSSProperties, memo, useCallback, useMemo, useState } from 'react'
import { FixedSizeList } from 'react-window'
import { useCopyToClipboard, useDebounceValue, useWindowSize } from 'usehooks-ts'
import useFullTokens, { TokenInfo } from '../../hooks/useFullTokens'
import { useIsSm } from '../../hooks/useMedia.ts'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { Token, addTokensToFollow } from '../../redux/slices/token'
import { PartialRecord } from '../../types.ts'
import { Fraction } from '../../utils/fraction'
import { divpowToFraction, mulpowToFraction } from '../../utils/number'
import BasicTokenInfo from '../BasicTokenInfo.tsx'
import { CloseIcon, SearchIcon } from '../Icons'
import { TitleT1, TitleT2 } from '../Texts'
import { useAptosWallet } from '@razorlabs/wallet-kit'

export interface TokenWithBalance extends Token {
  isFollowing: boolean
  fractionalBalance?: Fraction
  fractionalBalanceUsd?: Fraction
}

function TokenItem({
  index,
  data: { items, setToken, onCopy, copiedId, isCopying },
  style,
}: {
  index: number
  data: {
    items: TokenWithBalance[]
    setToken: (id: string) => void
    onCopy: (id: string) => void
    copiedId: string | null
    isCopying: boolean
  }
  style: CSSProperties
}) {
  const token = useMemo(() => {
    return items[index]!
  }, [items, index])

  const isCopyingThisToken = useMemo(() => isCopying && copiedId === token.id, [copiedId, isCopying, token.id])

  return (
    <div
      className={
        'bg-buttonDisabled flex h-fit w-full cursor-pointer items-center gap-2 rounded-none px-4 py-3 font-normal hover:bg-background' +
        ' ' +
        (token.isFollowing ? 'opacity-100' : 'opacity-20')
      }
      tabIndex={0}
      style={style}
      onClick={() => setToken(token.whitelisted ? token.symbol : token.id)}
    >
      <BasicTokenInfo token={token} onCopy={onCopy} isCopying={isCopyingThisToken} />
    </div>
  )
}

function ModalSelectToken({
  isOpen,
  onClose: _onClose,
  onOpenChange: _onOpenChange,
  setToken,
}: {
  isOpen: boolean
  onClose: () => void
  onOpenChange: () => void
  setToken: (id: string) => void
}) {
  const dispatch = useAppDispatch()
  const { data: fullTokenData } = useFullTokens()
  const followingTokenData = useAppSelector((state) => state.token.followingTokenData)
  const followingPriceData = useAppSelector((state) => state.price.followingPriceData)
  const { balance } = useAppSelector((state) => state.wallet)
  const { account } = useAptosWallet()
  const followingTokenDataWithBalance = useMemo(() => {
    const res: PartialRecord<string, TokenWithBalance> = {}
    for (const address of Object.keys(followingTokenData)) {
      const tokenData = followingTokenData[address]!
      let fractionalBalance: Fraction | undefined
      const tokenBalance = balance[address]
      if (account && tokenBalance) {
        fractionalBalance = divpowToFraction(tokenBalance, tokenData.decimals)
      }
      let fractionalBalanceUsd: Fraction | undefined
      if (fractionalBalance && followingPriceData[address]) {
        const fractionalPrice = mulpowToFraction(followingPriceData[address])
        fractionalBalanceUsd = fractionalBalance.multiply(fractionalPrice)
      }

      const newItem: TokenWithBalance = {
        id: tokenData.id,
        name: tokenData.name,
        symbol: tokenData.symbol,
        decimals: tokenData.decimals,
        whitelisted: tokenData.whitelisted,
        logoUrl: tokenData.logoUrl,
        fractionalBalance,
        fractionalBalanceUsd,
        isFollowing: true,
      }
      res[address] = newItem
    }
    return res
  }, [account, balance, followingPriceData, followingTokenData])
  const followingTokenDataWithBalanceList = useMemo(() => {
    const list = Object.values(followingTokenDataWithBalance) as TokenWithBalance[]
    list.sort((a: TokenWithBalance, b: TokenWithBalance) => {
      const x = a.fractionalBalanceUsd ?? new Fraction(0)
      const y = b.fractionalBalanceUsd ?? new Fraction(0)
      if (x.lessThan(y)) {
        return 1
      } else if (x.greaterThan(y)) {
        return -1
      }
      return a.symbol.localeCompare(b.symbol)
    })
    return list
  }, [followingTokenDataWithBalance])

  const onClose = useCallback(() => {
    setSearchValue('')
    _onClose()
  }, [_onClose])

  const onOpenChange = useCallback(() => {
    setSearchValue('')
    _onOpenChange()
  }, [_onOpenChange])

  const setTokenAndClose = useCallback(
    (id: string) => {
      dispatch(addTokensToFollow([id]))
      setToken(id)
      onClose()
    },
    [dispatch, onClose, setToken],
  )

  const [copiedId, copy] = useCopyToClipboard()
  const [isCopying, setIsCopying] = useState(false)
  const onCopy = useCallback(
    async (id: string) => {
      try {
        setIsCopying(true)
        await copy(id)
        await new Promise((resolve) => setTimeout(resolve, 500))
      } finally {
        setIsCopying(false)
      }
    },
    [copy],
  )

  const [_searchValue, setSearchValue] = useState('')
  const [searchValue] = useDebounceValue(_searchValue, 250)
  const renderFollowingTokenList = useMemo(() => {
    const str = searchValue.trim()
    if (!str) return followingTokenDataWithBalanceList

    const res = followingTokenDataWithBalanceList.filter((token) => {
      if (token.id === str) return true
      if (token.symbol.toLowerCase().includes(str.toLowerCase())) return true
      return false
    })
    return res
  }, [followingTokenDataWithBalanceList, searchValue])
  const renderUnfollowingTokenList = useMemo(() => {
    if (!fullTokenData) return []

    const str = searchValue.trim()
    if (!str) return []

    const fullTokenDataList = Object.values(fullTokenData) as TokenInfo[]
    const fullTokenList: TokenWithBalance[] = fullTokenDataList
      .filter((token) => {
        if (token.id === str) return true
        if (token.symbol.toLowerCase().includes(str.toLowerCase())) return true
        return false
      })
      .filter((token) => !renderFollowingTokenList.map((token) => token.id).includes(token.id))
      .map((token) => ({
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        whitelisted: false,
        logoUrl: undefined,
        fractionalBalance: undefined,
        fractionalBalanceUsd: undefined,
        isFollowing: false,
      }))
      .sort((a: TokenWithBalance, b: TokenWithBalance) => {
        const x = a.fractionalBalanceUsd ?? new Fraction(0)
        const y = b.fractionalBalanceUsd ?? new Fraction(0)
        if (x.lessThan(y)) {
          return 1
        } else if (x.greaterThan(y)) {
          return -1
        }
        return a.symbol.localeCompare(b.symbol)
      })
    return fullTokenList
  }, [fullTokenData, renderFollowingTokenList, searchValue])
  const renderTokenList = useMemo(
    () => [...renderFollowingTokenList, ...renderUnfollowingTokenList],
    [renderFollowingTokenList, renderUnfollowingTokenList],
  )
  const isEmpty = renderTokenList.length === 0

  const itemData = useMemo(
    () => ({ items: renderTokenList, setToken: setTokenAndClose, onCopy, copiedId, isCopying }),
    [copiedId, isCopying, onCopy, renderTokenList, setTokenAndClose],
  )

  const { height: windowHeight } = useWindowSize()
  const listHeight = useMemo(() => Math.min(680, Math.round(windowHeight / 2 / 68) * 68), [windowHeight])

  const isSm = useIsSm()

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
        hideCloseButton
        disableAnimation
        size={isSm ? 'full' : undefined}
      >
        <ModalContent
          className={
            'max-w-[420px] bg-dark0 p-4 pb-0 text-foreground dark' + ' ' + (isSm ? 'h-fit max-h-[70vh] self-end' : '')
          }
        >
          <>
            <div className="flex items-center justify-between">
              <TitleT1>Select a token</TitleT1>
              <Button isIconOnly variant="light" className="h-[20px] w-[20px] min-w-fit p-0" onPress={onClose}>
                <CloseIcon size={20} />
              </Button>
            </div>

            <Spacer y={4} />

            <Input
              type="text"
              placeholder="Search by token symbol or address"
              labelPlacement="outside"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="input-modal-select-token"
              startContent={<SearchIcon size={20} />}
              endContent={
                searchValue ? (
                  <Button
                    isIconOnly
                    className="m-0 h-fit w-fit min-w-fit border-transparent bg-transparent p-0"
                    disableRipple
                    onPress={() => setSearchValue('')}
                  >
                    <CloseIcon size={16} />
                  </Button>
                ) : null
              }
              value={_searchValue}
              onChange={(e) => setSearchValue(e.currentTarget.value)}
            />

            <Spacer y={4} />

            {renderTokenList && (
              <div className="relative -mx-4 border-t-1 border-t-background">
                <FixedSizeList
                  height={listHeight}
                  itemCount={renderTokenList.length}
                  itemSize={68}
                  width="100%"
                  itemData={itemData}
                >
                  {TokenItem}
                </FixedSizeList>
                {isEmpty && (
                  <TitleT2 className="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/2 text-light2">
                    No Token Found
                  </TitleT2>
                )}
              </div>
            )}
          </>
        </ModalContent>
      </Modal>
    </>
  )
}

const MemorizedModalSelectToken = memo(ModalSelectToken)
export default MemorizedModalSelectToken
