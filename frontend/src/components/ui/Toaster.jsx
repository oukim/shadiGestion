import { Toaster as HotToaster } from 'react-hot-toast'

export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: '#1C2030',
          color: '#ECEEF2',
          border: '1px solid #2A2F3D',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '13px',
          fontFamily: 'Sora, sans-serif',
          maxWidth: '360px',
        },
        success: {
          iconTheme: { primary: '#10B981', secondary: '#0F1117' },
          style: { borderLeft: '3px solid #10B981' },
        },
        error: {
          iconTheme: { primary: '#EF4444', secondary: '#0F1117' },
          style: { borderLeft: '3px solid #EF4444' },
        },
      }}
    />
  )
}