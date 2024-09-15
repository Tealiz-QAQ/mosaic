import { Icon } from '@iconify/react'
import { Button, Modal, ModalContent, Spacer } from '@nextui-org/react'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { setSlippage } from '../../redux/slices/user.ts'
import { mulpowToFraction } from '../../utils/number.ts'
import { CloseIcon } from '../Icons.tsx'
import { BodyB1, BodyB2, TitleT1 } from '../Texts.tsx'
import { NumericFormat } from 'react-number-format'

function ButtonSlippage({
  value,
  shouldHighlight,
  callback,
}: {
  value: number
  shouldHighlight: boolean
  callback: () => void
}) {
  const dispatch = useAppDispatch()
  const onPress = () => {
    dispatch(setSlippage(value))
    callback()
  }

  return (
    <Button
      className={
        'h-[40px] min-w-fit rounded-none bg-background p-5 sm:p-[10px]' + ' ' + (shouldHighlight ? '!bg-primary' : '')
      }
      disableAnimation
      onPress={onPress}
    >
      <BodyB1 className={'text-light2' + ' ' + (shouldHighlight ? '!text-black' : '')}>{value / 100}%</BodyB1>
    </Button>
  )
}

export default function ModalUserSetting({
  isOpen,
  onClose: _onClose,
  onOpenChange,
}: {
  isOpen: boolean
  onClose: () => void
  onOpenChange: () => void
}) {
  const dispatch = useAppDispatch()
  const slippageBps = useAppSelector((state) => state.user.slippageBps)
  const [input, setInput] = useState('')
  const [isFocusInput, setIsFocusInput] = useState(false)

  useEffect(() => {
    setInput((slippageBps / 100).toString())
  }, [slippageBps])

  const onInputFocus = () => {
    setIsFocusInput(true)
  }

  const onInputBlur = () => {
    setIsFocusInput(false)
    try {
      if (input === '') {
        setInput((slippageBps / 100).toString())
        return
      }
      const num = mulpowToFraction(input)
      if (num && num.greaterThan(0) && (num.lessThan(100) || num.equalTo(100))) {
        dispatch(setSlippage(parseInt(num.multiply(100).toSignificant(4))))
      } else {
        setInput((slippageBps / 100).toString())
      }
    } catch (err) {
      setInput((slippageBps / 100).toString())
    }
  }
  const onClose = () => {
    onInputBlur()
    _onClose()
  }

  const isHighlightInput = ![5, 10, 50, 100].includes(slippageBps) || isFocusInput

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
        hideCloseButton
        onClose={onClose}
      >
        <ModalContent className="max-w-[420px] bg-dark0 p-4 text-foreground dark">
          <>
            <div className="flex items-center justify-between">
              <TitleT1>General Settings</TitleT1>
              <Button isIconOnly variant="light" className="h-[20px] w-[20px] min-w-fit p-0" onPress={onClose}>
                <CloseIcon size={20} />
              </Button>
            </div>

            <Spacer y={4} />

            <div className="flex items-center gap-1">
              <BodyB2 className="w-fit text-light2">Max slippage</BodyB2>
              <Icon
                icon="material-symbols:info-outline"
                color="#9AA0A6"
                tabIndex={0}
                data-tooltip-id="tooltip-max-slippage"
              />
            </div>

            <Spacer y={3} />

            <div className="flex items-center overflow-hidden rounded">
              <ButtonSlippage
                value={5}
                shouldHighlight={!isHighlightInput && slippageBps === 5}
                callback={() => setInput((5 / 100).toString())}
              />
              <ButtonSlippage
                value={10}
                shouldHighlight={!isHighlightInput && slippageBps === 10}
                callback={() => setInput((10 / 100).toString())}
              />
              <ButtonSlippage
                value={50}
                shouldHighlight={!isHighlightInput && slippageBps === 50}
                callback={() => setInput((50 / 100).toString())}
              />
              <ButtonSlippage
                value={100}
                shouldHighlight={!isHighlightInput && slippageBps === 100}
                callback={() => setInput((100 / 100).toString())}
              />
              <div
                className={
                  'flex h-[40px] items-center gap-1 pr-3' +
                  ' ' +
                  (isHighlightInput ? 'bg-primary text-black' : 'bg-background text-light2')
                }
              >
                <NumericFormat
                  decimalSeparator="."
                  allowedDecimalSeparators={[',']}
                  className="w-full bg-transparent text-end text-base font-normal text-inherit outline-none placeholder:text-inherit"
                  inputMode="decimal"
                  autoComplete="off"
                  autoCorrect="off"
                  type="text"
                  minLength={1}
                  maxLength={30}
                  spellCheck="false"
                  pattern="^[0-9]{1,2}[.,]?[0-9]{0,2}$"
                  value={input}
                  onChange={(e) => setInput(e.currentTarget.value)}
                  onFocus={onInputFocus}
                  onBlur={onInputBlur}
                />
                <BodyB1 className="text-inherit">%</BodyB1>
              </div>
            </div>
          </>
        </ModalContent>
      </Modal>
    </>
  )
}
