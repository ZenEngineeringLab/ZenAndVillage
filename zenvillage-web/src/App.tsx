import { RouterProvider } from 'react-router'
import { Toaster } from 'sonner'
import { router } from './app/router'
import '@/i18n'

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors />
    </>
  )
}
