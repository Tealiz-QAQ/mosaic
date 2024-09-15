import { useAptosWallet } from '@razorlabs/wallet-kit'
import { Button, Image } from '@nextui-org/react'
import { TitleT2 } from '../Texts.tsx'
import { getWalletImagePath } from '../../constants/wallet.ts'
import { Icon } from '@iconify/react'

export default function ButtonWalletAddress({ onOpenModalHistories }: { onOpenModalHistories: () => void }) {
  const { address, name: walletName } = useAptosWallet()

  const onPressWalletAddress = () => {
    onOpenModalHistories()
  }

  if (!address) return null

  return (
    <Button
      color="primary"
      className="h-[36px] min-h-fit w-fit min-w-fit rounded-lg border-light2 bg-transparent px-4 sm:px-2"
      onPress={onPressWalletAddress}
      variant="bordered"
    >
      {walletName && <Image width={20} src={getWalletImagePath(walletName)} />}
      <TitleT2 className="text-light2">{address.slice(0, 4) + '...' + address.slice(-4)}</TitleT2>
      <Icon icon="tabler:chevron-down" fontSize={20} color="#8B8D91" />
    </Button>
  )
}
