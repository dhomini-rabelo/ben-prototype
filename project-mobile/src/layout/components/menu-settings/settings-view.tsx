import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ROUTES } from '@/core/routes'
import { AgentSettingsControls } from '@/layout/components/menu-settings/agent-settings-controls'
import { AgentSettingsError } from '@/layout/components/menu-settings/agent-settings-error'
import { AgentSettingsLoading } from '@/layout/components/menu-settings/agent-settings-loading'
import { useAgentPreferences } from '@/layout/hooks/use-agent-preferences'
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
  const agent = useAgentPreferences()

  function handleSignOut() {
    setSignOutState('pending')
    try {
      clear()
      router.replace(ROUTES.login)
    } catch {
      setSignOutState('failed')
    }
  }

  const agentSection =
    agent.state.status === 'loading' ? (
      <AgentSettingsLoading />
    ) : agent.state.status === 'error' || agent.state.selection === null ? (
      <AgentSettingsError onRetry={agent.actions.retry} />
    ) : (
      <AgentSettingsControls
        models={agent.state.models}
        modelSlug={agent.state.selection.modelSlug}
        effort={agent.state.selection.effort}
        isSaving={agent.state.isSaving}
        hasSaveError={agent.state.hasSaveError}
        onSelectModel={agent.actions.selectModel}
        onSelectEffort={agent.actions.selectEffort}
        onRetry={agent.actions.retry}
      />
    )

  return (
    <SettingsSheet
      variant={user ? 'populated' : 'error'}
      name={user?.name}
      email={user?.email}
      avatarUrl={user?.avatarUrl ?? undefined}
      signOutState={signOutState}
      agentSection={agentSection}
      onSignOut={handleSignOut}
      onRetry={handleSignOut}
      onClose={onClose}
    />
  )
}
