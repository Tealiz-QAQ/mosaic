import { Button, Image, Modal, ModalContent, Spacer } from '@nextui-org/react'
import { Fragment, useMemo } from 'react'
import { NOT_FOUND_TOKEN_LOGO_URL } from '../../constants'
import { SOURCES } from '../../constants/source.ts'
import { useIsMd } from '../../hooks/useMedia.ts'
import { useAppSelector } from '../../redux/hooks'
import { Fraction } from '../../utils/fraction.ts'
import { ChevronRight, CloseIcon } from '../Icons.tsx'
import { BodyB3, TitleT1, TitleT2 } from '../Texts.tsx'
import { GetRouteResponseDataPath } from '@mosaic-ag/ts-sdk'

export default function ModalTradeRoute({
  isOpen,
  onClose,
  onOpenChange,
  srcCoinType,
  dstCoinType,
  readableAmountIn,
  readableAmountOut,
  rawAmountIn,
  paths,
}: {
  isOpen: boolean
  onClose: () => void
  onOpenChange: () => void
  srcCoinType: string
  dstCoinType: string
  readableAmountIn: string
  readableAmountOut: string
  rawAmountIn: string | undefined
  paths: GetRouteResponseDataPath[][] | undefined
}) {
  paths = paths || []
  const followingTokenData = useAppSelector((state) => state.token.followingTokenData)

  const isLg = useIsMd()
  const gap = useMemo(
    () => (isLg ? { gap2: 'gap-[0px]', gap3: 'gap-[0px]' } : { gap2: 'gap-[98px]', gap3: 'gap-[32px]' }),
    [isLg],
  )
  const longestPathLength = useMemo(() => paths.reduce<number>((max, path) => Math.max(max, path.length), 1), [paths])
  const displayTokenSymbolInSeparateRow = isLg && longestPathLength >= 2

  if (!rawAmountIn) return null
  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
        hideCloseButton
        onClose={onClose}
        size={isLg ? 'full' : undefined}
      >
        <ModalContent
          className={
            'max-w-[800px] bg-background p-4 text-foreground dark' +
            ' ' +
            (isLg ? 'h-fit max-h-[70vh] min-h-[200px] self-end' : '')
          }
        >
          <>
            <div className="flex items-center justify-between">
              <TitleT1 className="w-[120px] text-light2">Swap route</TitleT1>
              <div className="w-[120px] text-end">
                <Button isIconOnly variant="light" className="h-[20px] w-[20px] min-w-fit p-0" onPress={onClose}>
                  <CloseIcon size={20} />
                </Button>
              </div>
            </div>

            <Spacer y={4} />

            <div className="flex justify-between">
              <TitleT2>
                {readableAmountIn} {followingTokenData[srcCoinType]?.symbol || '--'}
              </TitleT2>
              <TitleT2>
                {readableAmountOut} {followingTokenData[dstCoinType]?.symbol || '--'}
              </TitleT2>
            </div>

            <div className="overflow-auto">
              <div className="max-h-[70vh] w-full">
                {displayTokenSymbolInSeparateRow && (
                  <div className="flex items-center justify-between">
                    <Image
                      src={followingTokenData[srcCoinType]?.logoUrl || NOT_FOUND_TOKEN_LOGO_URL}
                      width="44px"
                      className="min-w-[44px] rounded-full bg-black2"
                    />
                    <Image
                      src={followingTokenData[dstCoinType]?.logoUrl || NOT_FOUND_TOKEN_LOGO_URL}
                      width="44px"
                      className="min-w-[44px] rounded-full bg-black2"
                    />
                  </div>
                )}
                {paths.map((path, pathIndex) => (
                  <div key={pathIndex} className="relative flex h-[44px] items-center">
                    {!displayTokenSymbolInSeparateRow ? (
                      pathIndex === 0 ? (
                        <Image
                          src={followingTokenData[srcCoinType]?.logoUrl || NOT_FOUND_TOKEN_LOGO_URL}
                          width="44px"
                          className="min-w-[44px] rounded-full bg-black2"
                        />
                      ) : (
                        <div className="h-[44px] w-[64px]" />
                      )
                    ) : null}
                    <div className="h-[22px] w-full self-end border-t-1 border-dashed border-primary" />
                    {!displayTokenSymbolInSeparateRow ? (
                      pathIndex === 0 ? (
                        <Image
                          src={followingTokenData[dstCoinType]?.logoUrl || NOT_FOUND_TOKEN_LOGO_URL}
                          width="44px"
                          className="min-w-[44px] rounded-full bg-black2"
                        />
                      ) : (
                        <div className="h-[44px] w-[64px]" />
                      )
                    ) : null}
                    {paths.length !== 1 && path[0] && (
                      <BodyB3 className="absolute left-[72px] top-1/2 z-10 -translate-y-1/2 bg-black2 px-1 text-primary md:left-[16px]">
                        {new Fraction(path[0].srcAmount, rawAmountIn).multiply(100).toSignificant(4)}%
                      </BodyB3>
                    )}

                    <div className="absolute right-[72px] flex h-[20px] w-[16px] items-center justify-center bg-background md:right-[16px]">
                      <ChevronRight size={20} />
                    </div>

                    {pathIndex !== 0 && (
                      <div
                        className={
                          'absolute left-[52px] top-[-22px] w-px border-l-1 border-dashed border-primary md:left-0' +
                          ' ' +
                          (pathIndex === paths.length - 1 ? 'h-[45px]' : 'h-[52px]')
                        }
                      />
                    )}
                    {pathIndex !== 0 && (
                      <div
                        className={
                          'absolute right-[52px] top-[-22px] w-px border-l-1 border-dashed border-primary md:right-0' +
                          ' ' +
                          (pathIndex === paths.length - 1 ? 'h-[45px]' : 'h-[52px]')
                        }
                      />
                    )}
                    <div
                      className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 ${path.length === 3 ? gap.gap3 : gap.gap2}`}
                    >
                      {path.map((hop, hopIndex) => (
                        <Fragment key={hopIndex}>
                          <div className="flex w-[120px] items-center justify-center md:w-[80px]">
                            <Button
                              className="flex h-[32px] items-center justify-center gap-1 bg-black2 p-0.5 data-[hover]:bg-black3"
                              onPress={() =>
                                window.open(`https://explorer.movementnetwork.xyz/account/${hop.poolId.split('::')[0]}?network=testnet`, '_blank')
                              }
                              disableAnimation
                            >
                              <Image
                                width="16px"
                                src={SOURCES[hop.source as keyof typeof SOURCES]?.logoUrl || NOT_FOUND_TOKEN_LOGO_URL}
                                className="min-w-[16px] rounded-full bg-black2"
                              />
                              <BodyB3 className="text-light2">
                                {(isLg
                                  ? SOURCES[hop.source as keyof typeof SOURCES]?.shortName
                                  : SOURCES[hop.source as keyof typeof SOURCES]?.name) || hop.source}
                              </BodyB3>
                            </Button>
                          </div>
                          {hopIndex !== path.length - 1 && (
                            <Button
                              className="h-[32px] w-[32px] min-w-[32px] data-[hover]:opacity-75"
                              variant="light"
                              onPress={() => window.open(`https://explorer.movementnetwork.xyz/account/${hop.dstCoinType.split("::")[0]}/resources?network=testnet`, '_blank')}
                            >
                              <Image
                                width="32px"
                                className="min-w-[32px] rounded-full bg-black2"
                                src={followingTokenData[hop.dstCoinType]?.logoUrl || NOT_FOUND_TOKEN_LOGO_URL}
                              />
                            </Button>
                          )}
                        </Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        </ModalContent>
      </Modal>
    </>
  )
}
