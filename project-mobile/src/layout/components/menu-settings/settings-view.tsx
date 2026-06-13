import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ROUTES } from '@/core/routes'
import { useAuthStore } from '@/layout/stores/auth-store'
import { SettingsSheet } from './settings-sheet'

type SignOutState = 'idle' | 'pending' | 'failed'

type SettingsViewProps = {
  onClose: () => void
}

export function SettingsView({ onClose }: SettingsViewProps) {
  const router = useRouter()
  const user = useAuthStore((store) => store.user)
  const clear = useAuthStore((store) => store.clear)
  const [signOutState, setSignOutState] = useState<SignOutState>('idle')

  function handleSignOut() {
    setSignOutState('pending')
    try {
      clear()
      router.replace(ROUTES.login)
    } catch {
      setSignOutState('failed')
    }
  }

  return (
    <SettingsSheet
      variant={user ? 'populated' : 'error'}
      name={user?.name}
      email={user?.email}
      avatarUrl={user?.avatarUrl ?? undefined}
      signOutState={signOutState}
      onSignOut={handleSignOut}
      onRetry={handleSignOut}
      onClose={onClose}
    />
  )
}
