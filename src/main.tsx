import { NextUIProvider } from '@nextui-org/react'
import { AptosWalletProvider } from '@razorlabs/wallet-kit'
import React from 'react'
import ReactDOM from 'react-dom/client'
import ReactGA from 'react-ga4'
import { Provider as ReduxProvider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import '@razorlabs/wallet-kit/style.css'
import 'react-toastify/dist/ReactToastify.css'
import 'react-tooltip/dist/react-tooltip.css'
import './main.css'
import './main.scss'
import { persistor, store } from './redux/store'
import Updaters from './redux/updaters/Updaters.tsx'
import { nightly, okx, razor } from './constants/wallet.ts'
import App from './App.tsx'

ReactGA.initialize('G-XLFPZGS0WB')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <NextUIProvider>
        <PersistGate persistor={persistor} loading={null}>
          <AptosWalletProvider defaultWallets={[razor, nightly, okx]} autoConnect={true}>
            <Updaters>
              <App />
            </Updaters>
          </AptosWalletProvider>
        </PersistGate>
      </NextUIProvider>
    </ReduxProvider>
  </React.StrictMode>,
)
