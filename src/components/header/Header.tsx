import { useState } from 'react'
import { Button } from '@nextui-org/react'
import { ChevronRight, MosaicIcon, MosaicTextIcon, OlympianIcon, SwapSculptureIcon } from '../Icons.tsx'
import { useAptosWallet } from '@razorlabs/wallet-kit'
import ModalConnectWallet from '../modals/ModalConnectWallet.tsx'
import ButtonWalletAddress from './ButtonWalletAddress.tsx'
import { useIsMd } from '../../hooks/useMedia.ts'
import { MODAL_LIST, Page } from '../modals/constant.ts'
import { Icon } from '@iconify/react'
import ModalAssetsAndActivities from '../modals/ModalAssetsAndActivities.tsx'
import ModalSelectPage from '../modals/ModalSelectPage.tsx'
import { TitleT1 } from '../Texts.tsx'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Header({ onOpenModal }: { onOpenModal: (modal: MODAL_LIST) => void }) {
  const isMd = useIsMd()

  const { account, connected: _connected } = useAptosWallet()
  const connected = account?.address && _connected

  const location = useLocation()
  const page = location.pathname.includes('/swap') ? Page.SWAP : Page.SPIN

  const navigate = useNavigate()

  const [isWalletModalOpen, setWalletModalOpen] = useState(false)

  const onSelectPage = (nextPage: Page) => {
    if (nextPage !== page) {
      nextPage === Page.SWAP ? navigate('/swap/MOVE-USDC') : navigate('/' + nextPage)
    }
  }

  const handleOpenWalletModal = () => {
    setWalletModalOpen(true)
  }

  const handleCloseWalletModal = () => {
    setWalletModalOpen(false)
  }

  return (
    <>
      <header className="z-[1] flex h-[73px] items-center justify-between bg-ffffff10 px-[60px] lg:px-[30px] md:px-[16px]">
        {isMd ? (
          <>
            <div className="flex items-center gap-1">
              <Button
                isIconOnly
                variant="light"
                className="h-fit w-fit rounded-none data-[hover]:bg-transparent"
                disableRipple
                onPress={() => (window.location.href = '/')}
              >
                <MosaicIcon size={28} className="min-h-[28px]" />
              </Button>
              <Button
                isIconOnly
                variant="light"
                className="flex h-fit w-fit min-w-fit items-center rounded-none data-[hover]:bg-transparent"
                disableRipple
                onPress={() => onOpenModal(MODAL_LIST.SELECT_PAGE)}
              >
                <Icon icon="mdi:menu" width={28} />
                <ChevronRight size={16} color="#FFFFFF" />
              </Button>
            </div>
            {connected ? (
              <ButtonWalletAddress onOpenModalHistories={() => onOpenModal(MODAL_LIST.ACTIVITIES)} />
            ) : (
              // Nếu chưa kết nối thì hiển thị nút Connect Wallet và modal
              <>
                <Button
                  className="h-[32px] w-fit min-w-fit rounded-lg px-2 py-0 font-normal"
                  onPress={handleOpenWalletModal}
                >
                  Connect wallet
                </Button>
                <ModalConnectWallet isOpen={isWalletModalOpen} onClose={handleCloseWalletModal} onOpenChange={handleCloseWalletModal} />
              </>
            )}
          </>
        ) : (
          <>
            <Button
              isIconOnly
              variant="light"
              className="h-fit w-[230px] justify-start rounded-none data-[hover]:bg-transparent"
              disableRipple
              onPress={() => (window.location.href = '/')}
            >
              <MosaicTextIcon size={40} className="min-h-[40px]" />
            </Button>
            <div className="flex items-center gap-5">
              <Button
                className="flex h-fit min-h-fit w-fit min-w-fit items-center gap-2 bg-transparent p-0"
                disableRipple
                onPress={() => onSelectPage(Page.SWAP)}
              >
                <SwapSculptureIcon size={31} color={page === Page.SWAP ? '#FACA20' : '#FFFFFF'} />
                <TitleT1
                  className={'font-GreekFreak font-medium' + ' ' + (page === Page.SWAP ? 'text-primary' : 'text-white')}
                >
                  SWAP
                </TitleT1>
              </Button>
              <Button
                className="flex h-fit min-h-fit w-fit min-w-fit items-center gap-2 bg-transparent p-0"
                disableRipple
                onPress={() => onSelectPage(Page.SPIN)}
              >
                <OlympianIcon size={31} color={page === Page.SPIN ? '#FACA20' : '#FFFFFF'} />
                <TitleT1
                  className={'font-GreekFreak font-medium' + ' ' + (page === Page.SPIN ? 'text-primary' : 'text-white')}
                >
                  THE OLYMPIAN FORTUNE
                </TitleT1>
              </Button>
            </div>
            <div className="text-end w-[200px]">
              {connected ? (
                <ButtonWalletAddress onOpenModalHistories={() => onOpenModal(MODAL_LIST.ACTIVITIES)} />
              ) : (
                // Nếu chưa kết nối thì hiển thị nút Connect Wallet và modal
                <>
                  <Button
                    className="h-[32px] w-fit min-w-fit rounded-lg px-2 py-0 font-normal bg-[#faca20] text-[#2e3337] font-bold"
                    onPress={handleOpenWalletModal}
                  >
                    Connect wallet
                  </Button>
                  <ModalConnectWallet isOpen={isWalletModalOpen} onClose={handleCloseWalletModal} onOpenChange={handleCloseWalletModal} />
                </>
              )}
            </div>
          </>
        )}
      </header>
      <ModalAssetsAndActivities />
      <ModalSelectPage />
    </>
  )
}
