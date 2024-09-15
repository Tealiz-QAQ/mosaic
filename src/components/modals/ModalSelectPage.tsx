import { Button, Modal, ModalContent } from '@nextui-org/react'
import { useContext } from 'react'
import { ModalContext } from './ModalContextProvider.tsx'
import { MODAL_LIST, Page } from './constant.ts'
import { TitleT1 } from '../Texts.tsx'
import { CloseIcon, OlympianIcon, SwapSculptureIcon } from '../Icons.tsx'
import { useLocation, useNavigate } from 'react-router-dom'

export default function ModalSelectPage() {
  const { globalModal, isModalOpen, onOpenChangeModal, onCloseModal } = useContext(ModalContext)
  const isOpen = globalModal === MODAL_LIST.SELECT_PAGE && isModalOpen

  const location = useLocation()
  const page = location.pathname.includes('/swap') ? Page.SWAP : Page.SPIN

  const navigate = useNavigate()

  const onSelectPage = (nextPage: Page) => {
    if (nextPage !== page) {
      nextPage === Page.SWAP ? navigate('/swap/MOVE-USDC') : navigate('/' + nextPage)
    }
    onCloseModal()
  }

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
              duration: 0.25,
              ease: 'easeOut',
            },
          },
          exit: {
            x: -250,
            opacity: 0,
            transition: {
              duration: 0.25,
              ease: 'easeIn',
            },
          },
        },
      }}
      className="h-screen max-h-screen w-full"
      hideCloseButton
    >
      <ModalContent className="flex flex-col gap-10 bg-dark0 px-6 pt-6 dark">
        <div className="flex items-center justify-between">
          <TitleT1 className="text-white">Select a page</TitleT1>
          <Button isIconOnly variant="light" className="h-fit min-h-fit w-fit min-w-fit p-0" onPress={onCloseModal}>
            <CloseIcon size={24} color="#FFFFFF" />
          </Button>
        </div>
        <Button
          className="flex h-fit min-h-fit w-fit min-w-fit items-center gap-2 bg-transparent p-0"
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
          onPress={() => onSelectPage(Page.SPIN)}
        >
          <OlympianIcon size={31} color={page === Page.SPIN ? '#FACA20' : '#FFFFFF'} />
          <TitleT1
            className={'font-GreekFreak font-medium' + ' ' + (page === Page.SPIN ? 'text-primary' : 'text-white')}
          >
            THE OLYMPIAN FORTUNE
          </TitleT1>
        </Button>
      </ModalContent>
    </Modal>
  )
}
