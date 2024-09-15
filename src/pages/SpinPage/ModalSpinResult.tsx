import { Button, Image, Modal, ModalContent } from '@nextui-org/react'
import { TitleT1 } from '../../components/Texts.tsx'
import { Fraction } from '../../utils/fraction.ts'

export default function ModalSpinResult({
  isOpen,
  onClose,
  onOpenChange,
  mosbAmount,
}: {
  isOpen: boolean
  onClose: () => void
  onOpenChange: () => void
  mosbAmount: Fraction | undefined
}) {
  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="opaque"
        hideCloseButton
        onClose={onClose}
      >
        <ModalContent className="max-w-[420px] bg-dark0 p-4 text-foreground dark">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center justify-center gap-1">
              <TitleT1>
                Congrats, you received <span className="text-primary">{mosbAmount?.toSignificant(2) || 0}</span> MOSB
              </TitleT1>
              <Image src="/images/mosb_icon.svg" width={20} />
            </div>

            <Image src="/images/spin_treasury.png" width={168} />

            <Button color="primary" onPress={onClose}>
              <TitleT1 className="px-8 font-bold text-dark0">Let&apos;s GOOO!</TitleT1>
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  )
}
