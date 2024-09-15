import { Button, Image, Link, Modal, ModalContent, Tab, Tabs } from '@nextui-org/react'
import React, { useCallback, useContext, useMemo, useState } from 'react'

import { Icon } from '@iconify/react'
import { useCopyToClipboard } from 'usehooks-ts'
import { NOT_FOUND_TOKEN_LOGO_URL } from '../../constants'
import useFullTokens from '../../hooks/useFullTokens.ts'
import { useAppSelector } from '../../redux/hooks'
import { Token } from '../../redux/slices/token.ts'
import { ITransactionHistory } from '../../redux/slices/user.ts'
import { PartialRecord } from '../../types.ts'
import { Fraction } from '../../utils/fraction.ts'
import { divpowToFraction, mulpowToFraction, numberWithCommas } from '../../utils/number.ts'
import { getDisplayPeriod } from '../../utils/time.ts'
import BasicTokenInfo from '../BasicTokenInfo.tsx'
import { ArrowRightIcon, PowerIcon } from '../Icons'
import { TitleT2, TitleT4, TitleT5 } from '../Texts'
import { TokenWithBalance } from './ModalSelectToken.tsx'
import { useAptosWallet } from '@razorlabs/wallet-kit'
import { ModalContext } from './ModalContextProvider.tsx'
import { MODAL_LIST } from './constant.ts'

export interface TransactionHistoryWithLogoUrl extends ITransactionHistory {
  tokenLogoIn: string
  tokenLogoOut: string
}

const ModalAssetsAndActivities: React.FC = () => {
  const { globalModal, isModalOpen, onOpenChangeModal, onCloseModal } = useContext(ModalContext)
  const isOpen = globalModal === MODAL_LIST.ACTIVITIES && isModalOpen

  const { account, disconnect, connecting: isConnecting } = useAptosWallet()
  const { balance } = useAppSelector((state) => state.wallet)
  const followingTokenData = useAppSelector((state) => state.token.followingTokenData)
  const { data: fullTokenData } = useFullTokens()
  const followingPriceData = useAppSelector((state) => state.price.followingPriceData)
  const assets = useMemo(() => {
    const res: PartialRecord<string, TokenWithBalance> = {}
    for (const key of Object.keys(balance)) {
      let fractionalBalance: Fraction | undefined
      const tokenBalance = balance[key]
      const tokenInfo = fullTokenData?.[key]
      if (fullTokenData && tokenBalance && tokenInfo) {
        if (account && tokenBalance) {
          fractionalBalance = divpowToFraction(tokenBalance, tokenInfo.decimals)
        }
        let fractionalBalanceUsd: Fraction | undefined
        if (fractionalBalance && followingPriceData?.[key]) {
          const fractionalPrice = mulpowToFraction(followingPriceData?.[key], tokenInfo.decimals)
          fractionalBalanceUsd = fractionalBalance.multiply(fractionalPrice)
        }
        res[key] = {
          id: key,
          name: tokenInfo.name,
          symbol: tokenInfo.symbol,
          decimals: tokenInfo.decimals,
          whitelisted: followingTokenData?.[key] ? followingTokenData[key].whitelisted : false,
          logoUrl: followingTokenData?.[key] ? followingTokenData[key].logoUrl : undefined,
          fractionalBalance,
          fractionalBalanceUsd,
          isFollowing: true,
        }
      }
    }
    return res
  }, [balance, fullTokenData, account, followingPriceData, followingTokenData])

  const assetTokenList = useMemo(() => {
    const list = Object.values(assets) as TokenWithBalance[]
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
  }, [assets])

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
  const txHistoryMap = useAppSelector((state) => state.user.txHistoryMap)
  const renderTransactionHistories = useMemo(() => {
    const transactionHistories = Object.values(txHistoryMap) as ITransactionHistory[]
    const followingTokenDataList = Object.values(followingTokenData) as Token[]
    return transactionHistories.map((transactionHistory) => {
      const tokenLogoIn =
        followingTokenDataList.find((token) => token.id === transactionHistory.tokenInAddress)?.logoUrl ?? ''
      const tokenLogoOut =
        followingTokenDataList.find((token) => token.id === transactionHistory.tokenOutAddress)?.logoUrl ?? ''
      const res: TransactionHistoryWithLogoUrl = {
        txHash: transactionHistory.txHash,
        isSuccess: transactionHistory.isSuccess,
        details: transactionHistory.details,
        tokenInSymbol: transactionHistory.tokenInSymbol,
        tokenOutSymbol: transactionHistory.tokenOutSymbol,
        readableAmountIn: transactionHistory.readableAmountIn,
        readableAmountOut: transactionHistory.readableAmountOut,
        tokenLogoIn: tokenLogoIn,
        tokenLogoOut: tokenLogoOut,
        timestamp: transactionHistory.timestamp,
        tokenInAddress: transactionHistory.tokenInAddress,
        tokenOutAddress: transactionHistory.tokenOutAddress,
      }
      return res
    })
  }, [txHistoryMap, followingTokenData])

  const totalBalanceInUSD = useMemo(() => {
    if (!assets) return 0
    return (Object.values(assets) as TokenWithBalance[]).reduce(
      (prev, curr) => curr.fractionalBalanceUsd?.add(prev) ?? prev,
      new Fraction(0),
    )
  }, [assets])

  return (
    <Modal
      scrollBehavior="inside"
      isOpen={isOpen}
      onOpenChange={onOpenChangeModal}
      placement="center"
      backdrop="transparent"
      size="full"
      classNames={{
        wrapper: 'flex justify-end',
      }}
      motionProps={{
        variants: {
          enter: {
            x: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: 'easeOut',
            },
          },
          exit: {
            x: 50,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: 'easeIn',
            },
          },
        },
      }}
      className="h-screen max-h-screen w-full max-w-sm"
      hideCloseButton
    >
      <ModalContent className="flex flex-col rounded-lg bg-dark0 px-6 pt-6 dark">
        <div className="mb-6 flex flex-row justify-between">
          <Button className="h-[20px] w-[20px] justify-start bg-transparent p-0" isIconOnly onPress={onCloseModal}>
            <ArrowRightIcon size={20} className="flex-none" />
          </Button>
          <div className="flex flex-row">
            {account?.address ? (
              <TitleT2 className="mr-2 leading-5 text-white">
                {account.address.slice(0, 4) + '...' + account.address.slice(-4)}
              </TitleT2>
            ) : isConnecting ? (
              <TitleT2 className="mr-2 leading-5 text-buttonRed">Loading wallet</TitleT2>
            ) : (
              <TitleT2 className="mr-2 leading-5 text-buttonRed">Connect wallet</TitleT2>
            )}
            <Button
              className="mr-2 h-[20px] w-[20px] min-w-0 bg-transparent p-0"
              isIconOnly
              onPress={async () => {
                if (account?.address) {
                  await onCopy(account.address)
                }
              }}
            >
              {isCopying && copiedId === account?.address ? (
                <Icon icon="material-symbols:check" fontSize={20} className="text-light2" />
              ) : (
                <Icon icon="ph:copy" fontSize={20} className="text-light2" />
              )}
            </Button>
            <Link
              href={`https://explorer.movementnetwork.xyz/account/${account?.address}?network=testnet`}
              isExternal
              showAnchorIcon
              className="text-light2"
            />
          </div>
          <Button
            className="h-[20px] w-[20px] min-w-0 flex-none justify-end bg-transparent p-0"
            isIconOnly
            onPress={() => {
              onCloseModal()
              void disconnect()
            }}
          >
            <PowerIcon size={20} />
          </Button>
        </div>
        <div className="mb-6 text-[36px] font-semibold text-white">
          ${totalBalanceInUSD ? `${numberWithCommas(totalBalanceInUSD?.toSignificant(6), false)}` : undefined}
        </div>
        <div className="flex w-full flex-col">
          <Tabs
            radius="sm"
            variant="light"
            size="md"
            color="primary"
            classNames={{ tabList: 'rounded p-0', cursor: 'rounded' }}
          >
            <Tab key="assets" title="Assets">
              <div className="h-[calc(100vh-12rem)] overflow-auto">
                {assetTokenList.length === 0 ? (
                  <TitleT4 className="pt-4 text-center">No asset found</TitleT4>
                ) : (
                  assetTokenList.map((assetToken) => (
                    <AssetRow
                      key={assetToken.id}
                      token={assetToken}
                      onCopy={onCopy}
                      isCopying={isCopying}
                      copiedId={copiedId ?? ''}
                    />
                  ))
                )}
              </div>
            </Tab>
            <Tab key="activities" title="Activities" className="pt-0">
              <div className="h-[calc(100vh-12rem)] overflow-auto">
                {renderTransactionHistories.length === 0 ? (
                  <TitleT4 className="mt-16 h-full text-center text-white">No activity found</TitleT4>
                ) : (
                  renderTransactionHistories
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .map((transactionHistory) => {
                      return <ActivityRow key={transactionHistory.timestamp} transactionHistory={transactionHistory} />
                    })
                )}
              </div>
            </Tab>
          </Tabs>
        </div>
      </ModalContent>
    </Modal>
  )
}

function AssetRow({
  token,
  onCopy,
  copiedId,
  isCopying,
}: {
  token: TokenWithBalance
  onCopy: (id: string) => void
  copiedId: string
  isCopying: boolean
}) {
  const isCopyingThisToken = useMemo(() => isCopying && copiedId === token.id, [copiedId, isCopying, token.id])
  return (
    <div className="py-2">
      <BasicTokenInfo token={token} onCopy={onCopy} isCopying={isCopyingThisToken} />
    </div>
  )
}

function ActivityRow({ transactionHistory }: { transactionHistory: TransactionHistoryWithLogoUrl }) {
  const [tokenInLogoSrc, setTokenInLogoSrc] = useState(transactionHistory.tokenLogoIn || NOT_FOUND_TOKEN_LOGO_URL)
  const [tokenOutLogoSrc, setTokenOutLogoSrc] = useState(transactionHistory.tokenLogoOut || NOT_FOUND_TOKEN_LOGO_URL)
  return (
    <div className="flex flex-row items-center justify-between py-2">
      <div className="flex flex-col gap-1">
        <div className="flex flex-row items-center gap-1">
          <TitleT2 className="text-white">Swapped</TitleT2>
          <Link
            href={`https://explorer.movementnetwork.xyz/txn/${transactionHistory.txHash}?network=testnet`}
            isExternal
            className="text-light2"
            showAnchorIcon
          />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Image
            width={16}
            height={16}
            src={tokenInLogoSrc}
            onError={() => setTokenInLogoSrc(NOT_FOUND_TOKEN_LOGO_URL)}
          />
          <TitleT5 className="text-light2">
            {transactionHistory.readableAmountIn} {transactionHistory.tokenInSymbol} to{' '}
          </TitleT5>
          <Image
            width={16}
            height={16}
            src={tokenOutLogoSrc}
            onError={() => setTokenOutLogoSrc(NOT_FOUND_TOKEN_LOGO_URL)}
          />
          <TitleT5 className="text-light2">
            {transactionHistory.readableAmountOut} {transactionHistory.tokenOutSymbol}
          </TitleT5>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex flex-col items-end gap-1">
          <TitleT2 className="leading-5 text-white">{transactionHistory.isSuccess ? 'Success' : 'Failed'}</TitleT2>
          <TitleT5 className="text-light2">{getDisplayPeriod(Date.now() - transactionHistory.timestamp)}</TitleT5>
        </div>
      </div>
    </div>
  )
}

export default ModalAssetsAndActivities
