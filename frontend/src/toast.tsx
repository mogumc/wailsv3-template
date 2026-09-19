import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Alert, Snackbar } from '@mui/material'

type Severity = 'success' | 'info' | 'warning' | 'error'

interface ToastContextValue {
  toast: (message: string, severity?: Severity) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/** 替代 Element Plus 的 ElMessage：全局轻提示 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [severity, setSeverity] = useState<Severity>('info')
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const toast = useCallback((msg: string, sev: Severity = 'info') => {
    setMessage(msg)
    setSeverity(sev)
    setOpen(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setOpen(false), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Snackbar
        open={open}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={severity} variant="filled" sx={{ minWidth: 240 }}>
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast 必须在 ToastProvider 内使用')
  return ctx
}
