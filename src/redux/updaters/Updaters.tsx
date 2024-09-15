import { ReactNode, useEffect } from 'react'
import { VERSION } from '../../constants'
import { useAppSelector } from '../hooks'
import PriceUpdater from './PriceUpdater'
import TokenUpdater from './TokenUpdater'
import WalletUpdater from './WalletUpdater'
import { persistor } from '../store.ts'

export default function Updaters({ children }: { children: ReactNode }) {
  const version = useAppSelector((state) => state.user.version)
  useEffect(() => {
    const fn = async () => {
      if (version !== VERSION) {
        await persistor.purge()
        window.location.reload()
      }
    }
    void fn()
  }, [version])

  if (version !== VERSION) return null

  return (
    <>
      <WalletUpdater />
      <TokenUpdater />
      <PriceUpdater />
      {children}
    </>
  )
}
