import { BodyB2 } from './Texts.tsx'
import { Link } from '@nextui-org/react'
import { Icon } from '@iconify/react'
import { useIsSm } from '../hooks/useMedia.ts'

export default function Footer() {
  const isSm = useIsSm()

  return (
    <footer className="flex w-full flex-1 items-end z-[1]">
      <div className="flex h-[84px] w-full content-center items-center justify-between px-[60px] lg:px-[30px] md:static md:px-[16px] sm:justify-center">
        <div className="flex items-center gap-2">
          <BodyB2 className="text-light2">© Mosaic 2024</BodyB2>

          <div className="flex items-center">
            <Link
              isBlock
              href="https://x.com/mosaicagg"
              color="primary"
              className="text-light2"
              disableAnimation
              size="sm"
              isExternal
            >
              <Icon icon="mdi:twitter" fontSize={16} />
            </Link>
            <Link
              isBlock
              href="https://discord.gg/mosaicagg"
              color="primary"
              className="text-light2"
              disableAnimation
              size="sm"
              isExternal
            >
              <Icon icon="ic:baseline-discord" fontSize={16} />
            </Link>
          </div>
        </div>
        {isSm ? (
          <div />
        ) : (
          <div className="flex items-center gap-5 md:gap-0">
            <Link
              isBlock
              href="https://docs.mosaic.ag"
              color="primary"
              className="text-light2"
              size="sm"
              isExternal
              showAnchorIcon
            >
              <BodyB2>Documentations</BodyB2>
            </Link>
          </div>
        )}
      </div>
    </footer>
  )
}
