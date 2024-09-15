import { memo, useEffect } from 'react'
import { useInterval } from 'usehooks-ts'
import useRefreshBalanceFn from '../../hooks/useRefreshBalanceFn'

function WalletUpdater() {
  const refreshBalance = useRefreshBalanceFn()

  useEffect(() => {
    void refreshBalance()
  }, [refreshBalance])

  useInterval(refreshBalance, 10_000)

  return null
}

const MemoWalletUpdater = memo(WalletUpdater)
export default MemoWalletUpdater
