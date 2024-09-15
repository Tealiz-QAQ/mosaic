import { createContext, ReactNode, useCallback, useMemo, useState } from 'react'
import { useDisclosure } from '@nextui-org/react'
import { MODAL_LIST } from './constant.ts'

export const ModalContext = createContext({
  globalModal: MODAL_LIST.SELECT_TOKEN_IN,
  isModalOpen: false,
  onOpenModal: (_modal: MODAL_LIST) => {},
  onCloseModal: () => {},
  onOpenChangeModal: () => {},
})

function useModal() {
  const [globalModal, setGlobalModal] = useState(MODAL_LIST.SELECT_TOKEN_IN)
  const { isOpen, onOpen: _onOpen, onClose, onOpenChange } = useDisclosure()

  const onOpen = useCallback(
    (modal: MODAL_LIST) => {
      onClose()
      setGlobalModal(modal)
      _onOpen()
    },
    [_onOpen, onClose],
  )

  const res = useMemo(
    () => ({
      globalModal,
      isModalOpen: isOpen,
      onOpenModal: onOpen,
      onCloseModal: onClose,
      onOpenChangeModal: onOpenChange,
    }),
    [globalModal, isOpen, onClose, onOpen, onOpenChange],
  )
  return res
}

export default function ModalContextProvider({ children }: { children: ReactNode }) {
  const { globalModal, isModalOpen, onOpenModal, onCloseModal, onOpenChangeModal } = useModal()
  return (
    <ModalContext.Provider
      value={{
        globalModal,
        isModalOpen,
        onOpenModal,
        onCloseModal,
        onOpenChangeModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  )
}
