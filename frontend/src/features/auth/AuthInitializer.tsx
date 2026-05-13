import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from './authStore'

interface AuthInitializerProps {
  children: ReactNode
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
  const initializeAuthListener = useAuthStore((s) => s.initializeAuthListener)

  useEffect(() => {
    const unsubscribe = initializeAuthListener()
    return unsubscribe
  }, [initializeAuthListener])

  return <>{children}</>
}
