import { Accordion, AccordionItem, Button, Image, useDisclosure } from '@nextui-org/react'
import { BodyB2, TitleT1, TitleT2 } from '../../components/Texts.tsx'
import { useAppSelector } from '../../redux/hooks'
import { useMemo, useState } from 'react'
import { divpowToFraction } from '../../utils/number.ts'
import { MOSA, MOSB } from '../../constants/token.ts'
import useRefreshBalanceFn from '../../hooks/useRefreshBalanceFn.ts'
import { aptos } from '../../constants'
import { useAptosWallet } from '@razorlabs/wallet-kit'
import { Ed25519PublicKey, isUserTransactionResponse } from '@aptos-labs/ts-sdk'
import invariant from 'invariant'
import { Timeout } from 'react-number-format/types/types'
import { Fraction } from '../../utils/fraction.ts'
import ModalSpinResult from './ModalSpinResult.tsx'
import ReactGA from 'react-ga4'
import { toast } from 'react-toastify'
import { isDesktop } from 'react-device-detect'
import useMovementNetwork from '../../hooks/useMovementNetwork.ts'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from '../../components/Icons.tsx'

const SPIN_FUNCTION = '0xe7d668e27e18fa54a50a6dac99e596f8bc2539ebfbf93e68700100dea2062b19::router::spin'
const SPIN_EVENT = '0xe7d668e27e18fa54a50a6dac99e596f8bc2539ebfbf93e68700100dea2062b19::router::SpinEvent'

export default function SpinPage() {
  const balance = useAppSelector((state) => state.wallet.balance)
  const balanceMOSA = useMemo(() => divpowToFraction(balance[MOSA.id] || '0', MOSA.decimals), [balance])
  const balanceMOSB = useMemo(() => divpowToFraction(balance[MOSB.id] || '0', MOSB.decimals), [balance])

  const [imageIndex, setImageIndex] = useState<number | undefined>(undefined)

  const refreshBalance = useRefreshBalanceFn()

  const [spinning, setSpinning] = useState(false)
  const [mosbAmount, setMosbAmount] = useState<Fraction | undefined>(undefined)

  const { account, signAndSubmitTransaction } = useAptosWallet()

  const {
    isOpen: isOpenSpinResultModal,
    onOpen: onOpenSpinResultModal,
    onClose: onCloseSpinResultModal,
    onOpenChange: onOpenChangeSpinResultModal,
  } = useDisclosure()

  const { isLoadingNetworkStatus, isNetworkStable } = useMovementNetwork()

  const navigate = useNavigate()

  const spinButton = useMemo(() => {
    if (spinning) return { isDisabled: true, text: 'Rolling...' }
    if (!account) return { isDisabled: true, text: 'Connect wallet' }
    if (isLoadingNetworkStatus) return { isDisabled: true, text: 'Checking network status...' }
    if (!isNetworkStable) return { isDisabled: true, text: 'Network is not stable now' }
    if (balanceMOSA.lessThan(100)) return { isDisabled: false, text: 'Swap to get more MOSA' }
    return { isDisabled: false, text: 'ROLL!!!!!!' }
  }, [account, balanceMOSA, isLoadingNetworkStatus, isNetworkStable, spinning])

  const spin = async () => {
    if (spinButton.isDisabled || !account) return

    if (balanceMOSA.lessThan(100)) {
      navigate('/swap/MOVE-USDC')
      return
    }

    let interval: Timeout | undefined

    let hash: string | undefined

    try {
      setSpinning(true)
      setMosbAmount(undefined)

      // 1. Build transaction.
      const payload = {
        function: SPIN_FUNCTION,
        functionArguments: [],
      }
      const transaction = await aptos.transaction.build.simple({
        sender: account.address,
        data: payload as any,
      })

      // 2. Simulate transaction.
      const simulateResponses = await aptos.transaction.simulate.simple({
        signerPublicKey: new Ed25519PublicKey(account.publicKey),
        transaction,
      })
      invariant(simulateResponses.length === 1, 'simulateResponse length should be 1')
      const simulateResponse = simulateResponses[0]
      invariant(simulateResponse.success, simulateResponse.vm_status)

      // 3. Submit transaction.
      const submitResponse = await signAndSubmitTransaction({ payload: payload as any })

      const fn = () => {
        setImageIndex((prev) => ((prev === undefined ? -1 : prev) + 1) % 10)
      }
      fn()
      interval = setInterval(fn, 100)

      // 4. Get submitted transaction hash.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
      invariant(submitResponse.status === 'Approved', 'submitResponse.status REJECTED')
      hash = submitResponse.args.hash

      // 5. Wait tx finalize and get receipt.
      const aptosResponse = await aptos.waitForTransaction({
        transactionHash: hash,
        options: {
          checkSuccess: false,
          timeoutSecs: 10,
          waitForIndexer: true,
        },
      })
      invariant(
        isUserTransactionResponse(aptosResponse),
        `something is wrong. aptosResponse = ${JSON.stringify(aptosResponse, null, 4)}`,
      )

      // 6. Parse MOSB amount.
      const spinEvent = aptosResponse.events.find((e) => e.type === SPIN_EVENT)
      invariant(spinEvent, 'not found spin event')
      const mosb_amount = spinEvent.data.mosb_amount
      invariant(mosb_amount, 'not found mosb_amount')
      setMosbAmount(divpowToFraction(mosb_amount, 8))
      onOpenSpinResultModal()
      ReactGA.event({
        category: 'spin',
        action: 'spin_success',
        label: '',
        value: 1,
        nonInteraction: true,
        transport: 'beacon',
      })

      // 6. Open spin success modal and refresh balance
    } catch (err) {
      console.error(err)

      const jsonErr = JSON.stringify(err)
      if (jsonErr !== `{"code":"WALLET.SIGN_TX_ERROR"}`) {
        let errorDetails: string | undefined
        if (typeof err === 'string') {
          errorDetails = err
        } else {
          errorDetails = (err as any)?.message || undefined
        }
        toast(
          <div className="rounded bg-[rgba(244,70,70,0.2)] p-4">
            <TitleT2>Error rolling</TitleT2>
            {errorDetails && <BodyB2>{errorDetails}</BodyB2>}
          </div>,
          {
            className: 'z-toast',
            bodyClassName: 'z-toast-body',
            progressClassName: 'z-toast-progress-failed',
            autoClose: isDesktop ? 4000 : false,
            pauseOnHover: isDesktop,
            position: 'top-right',
          },
        )
        ReactGA.event({
          category: 'spin',
          action: 'spin_error',
          label: errorDetails,
          value: 0,
          nonInteraction: true,
          transport: 'beacon',
        })
      }
    } finally {
      setSpinning(false)
      interval && clearInterval(interval)
      void refreshBalance()
    }
  }

  return (
    <>
      <main className="isolate">
        <div className="fixed top-0 h-full w-screen bg-[url('/images/spin_bg.png')] bg-cover bg-center bg-no-repeat" />
        <Image
          src="/images/spin_obj_1.png"
          className="fixed bottom-0 right-[5vw] h-[50vh] xl:right-0 xl:h-[45vh] lg:hidden"
        />
        <Image src="/images/spin_obj_2.png" className="fixed right-[4vw] top-[140px] h-[25vh] xl:right-0 lg:hidden" />
        <Image src="/images/spin_obj_3.png" className="fixed left-0 top-[140px] h-[20vh] xl:right-0 lg:hidden" />
        <Image
          src="/images/spin_obj_4.png"
          className="fixed bottom-0 left-0 h-[35vh] xl:left-0 xl:h-[25vh] lg:hidden"
        />

        <div className="isolate mx-auto mt-5 flex max-w-[506px] flex-col items-center gap-3 px-4">
          <div className="flex w-full flex-col items-center gap-3 rounded-lg bg-black2 py-5">
            <div className="flex flex-col items-center">
              <div className="font-GreekFreak text-[32px] leading-none sm:text-[24px]">
                Spend <span className="font-GreekFreak text-primary">100 MOSA</span> to get{' '}
                <span className="font-GreekFreak text-primary">1 roll</span>
              </div>
              <div className="text-center text-sm italic text-light2">
                For every roll, you&apos;ll get a random amount of MOSB.
              </div>
            </div>
            <div className="relative h-[300px] w-[300px]">
              {Array.from(Array(11).keys()).map((index) => (
                <img
                  key={index}
                  src={`/images/spin_${index}.png`}
                  className={
                    'absolute left-0 top-0 w-[300px] rounded-none' +
                    ' ' +
                    ((imageIndex === undefined && index === 0) || (imageIndex !== undefined && imageIndex + 1 === index)
                      ? 'flex'
                      : 'hidden')
                  }
                  alt={`/images/spin_${index}.png`}
                />
              ))}
            </div>
            <Button
              color="primary"
              className="min-w-[182px] rounded-lg px-8"
              disableRipple
              onPress={spin}
              isDisabled={spinButton.isDisabled}
            >
              <TitleT1 className="font-GreekFreak text-[20px] font-semibold text-dark0">{spinButton.text}</TitleT1>
            </Button>
          </div>

          <div className="flex w-full flex-col items-center gap-3 rounded-lg bg-black2 px-7 py-5 sm:px-4 sm:py-4">
            <div className="flex w-full justify-between gap-4 rounded-lg border-1 border-[#F8F9FA66] bg-[#07070799] px-4 py-2 sm:px-2">
              <TitleT2>MOSA earned</TitleT2>
              <div className="flex items-center gap-2">
                <TitleT2 className="!font-bold">{Number(balanceMOSA.toSignificant(6))} MOSA</TitleT2>
                <Image src="/images/mosa_icon.svg" width="26px" className="rounded-full" />
              </div>
            </div>
            <div className="flex w-full justify-between gap-4 rounded-lg border-1 border-[#F8F9FA66] bg-[#07070799] px-4 py-2 sm:px-2">
              <TitleT2>MOSB earned</TitleT2>
              <div className="flex items-center gap-2">
                <TitleT2 className="!font-bold">{Number(balanceMOSB.toSignificant(6))} MOSB</TitleT2>
                <Image src="/images/mosb_icon.svg" width="26px" className="rounded-full" />
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col items-center gap-3 rounded-lg bg-black2 px-10 py-5 sm:p-5">
            <TitleT1 className="font-semibold">FAQ</TitleT1>
            <Accordion className="m-0 p-0" showDivider={false}>
              <AccordionItem
                key="1"
                aria-label="What is MOSB?"
                title="What is MOSB?"
                className="m-0 p-0"
                classNames={{
                  title: 'text-sm',
                  trigger: 'p-0 py-1 m-0',
                  content: 'text-xs italic text-light2',
                }}
                indicator={<ChevronRight size={16} className="rotate-180" />}
              >
                MOSB is a Mosaic’s on-chain token on Movement Testnet.
              </AccordionItem>
              <AccordionItem
                key="2"
                aria-label="What can I do with MOSB?"
                title="What can I do with MOSB?"
                classNames={{
                  title: 'text-sm',
                  trigger: 'p-0 py-1 m-0',
                  content: 'text-xs italic text-light2',
                }}
                indicator={<ChevronRight size={16} className="rotate-180" />}
              >
                You figure it out yourself. We don’t know!
              </AccordionItem>
              <AccordionItem
                key="3"
                aria-label="WHAT????"
                title="WHAT????"
                classNames={{
                  title: 'text-sm',
                  trigger: 'p-0 py-1 m-0',
                  content: 'text-xs italic text-light2',
                }}
                indicator={<ChevronRight size={16} className="rotate-180" />}
              >
                WE CAN&apos;T DISCLOSE NOW!
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>
      <ModalSpinResult
        isOpen={isOpenSpinResultModal}
        onClose={onCloseSpinResultModal}
        onOpenChange={onOpenChangeSpinResultModal}
        mosbAmount={mosbAmount}
      />
    </>
  )
}
