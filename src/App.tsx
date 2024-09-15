import { ReactNode, useContext } from 'react'
import { ToastContainer } from 'react-toastify'
import Tooltips from './components/Tooltips'
import Header from './components/header/Header.tsx'
import Footer from './components/Footer.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import NavigateWithParams from './components/NavigateWithParams.tsx'
import SwapPage from './pages/SwapPage.tsx'
import ModalContextProvider, { ModalContext } from './components/modals/ModalContextProvider.tsx'
import SpinPage from './pages/SpinPage/SpinPage.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <NavigateWithParams to="/swap/MOVE-USDC" />,
  },
  {
    path: '/swap/:pair',
    element: (
      <AppLayout>
        <SwapPage />
      </AppLayout>
    ),
  },
  {
    path: '/spin',
    element: (
      <AppLayout>
        <SpinPage />
      </AppLayout>
    ),
  },
  {
    path: '*',
    element: <NavigateWithParams to="/swap/MOVE-USDC" />,
  },
])

function AppLayout({ children }: { children: ReactNode }) {
  const { onOpenModal } = useContext(ModalContext)
  return (
    <>
      <div className="min-h-screen w-screen bg-background text-foreground dark">
        <div className="flex min-h-screen w-screen flex-col">
          <Header onOpenModal={onOpenModal} />
          {children}
          <Footer />
        </div>
      </div>
    </>
  )
}

export default function App() {
  return (
    <ModalContextProvider>
      <RouterProvider router={router} />
      <ToastContainer
        autoClose={4000}
        draggablePercent={50}
        theme="dark"
        position="top-right"
        closeButton={false}
        pauseOnHover={false}
      />
      <Tooltips />
    </ModalContextProvider>
  )
}
