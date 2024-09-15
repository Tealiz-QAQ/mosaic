import { useEffect, useState } from 'react'
import { NOT_FOUND_TOKEN_LOGO_URL } from '../constants'
import { Button, Image } from '@nextui-org/react'
import { BodyB3, TitleT2, TitleT5 } from './Texts.tsx'
import { Icon } from '@iconify/react'
import { TokenWithBalance } from './modals/ModalSelectToken.tsx'
import { numberWithCommas } from '../utils/number.ts'

export default function BasicTokenInfo({
  token,
  onCopy,
  isCopying,
}: {
  token: TokenWithBalance
  onCopy: (id: string) => void
  isCopying: boolean
}) {
  const [src, setSrc] = useState(token.logoUrl || NOT_FOUND_TOKEN_LOGO_URL)

  useEffect(() => {
    setSrc(token.logoUrl || NOT_FOUND_TOKEN_LOGO_URL)
  }, [token, onCopy])

  return (
    <div className="flex w-full items-center gap-2" tabIndex={0}>
      <Image
        width={20}
        height={20}
        src={src}
        onError={() => setSrc(NOT_FOUND_TOKEN_LOGO_URL)}
        className="flex h-[20px] min-h-[20px] w-[20px] min-w-[20px] rounded-full bg-white"
        disableSkeleton
      />
      <div className="flex grow flex-col gap-1 overflow-hidden">
        <div className="flex items-baseline gap-1">
          <TitleT2 className="text-white">{token.symbol}</TitleT2>
          <Button
            variant="light"
            className="h-fit w-fit min-w-fit gap-1 self-center rounded-none p-0 font-normal data-[hover]:bg-transparent"
            onPress={() => onCopy(token.id)}
            disableAnimation
            disableRipple
          >
            {isCopying ? (
              <>
                <TitleT5
                  className="overflow-hidden text-ellipsis whitespace-nowrap pt-1 text-light2"
                  onClick={() => onCopy(token.id)}
                >
                  {token.id.slice(0, 10) + '...'}
                </TitleT5>
                <Icon icon="material-symbols:check" fontSize={16} className="text-light2" />
              </>
            ) : (
              <>
                <TitleT5
                  className="overflow-hidden text-ellipsis whitespace-nowrap pt-1 text-light2"
                  onClick={() => onCopy(token.id)}
                >
                  {token.id.slice(0, 10) + '...'}
                </TitleT5>
                <Icon icon="ph:copy" fontSize={16} className="text-light2" />
              </>
            )}
          </Button>
        </div>
        <TitleT5 className="w-full flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-start text-light2">
          {token.name}
        </TitleT5>
      </div>
      <div className="flex flex-col items-end justify-between gap-1">
        <TitleT2 className="text-white">
          {token.fractionalBalance ? token.fractionalBalance?.toSignificant(6) : undefined}
        </TitleT2>
        <BodyB3 className="text-light2">
          {token.fractionalBalanceUsd
            ? `~$${numberWithCommas(token.fractionalBalanceUsd?.toSignificant(6))}`
            : undefined}
        </BodyB3>
      </div>
    </div>
  )
}
