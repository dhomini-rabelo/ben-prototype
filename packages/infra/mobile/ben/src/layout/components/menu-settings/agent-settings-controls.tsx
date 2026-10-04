import { View, Pressable } from 'react-native'
import type {
  AgentEffort,
  AgentModelOption as AgentModelOptionType,
  AgentModelSlug,
} from '@/api/models/agent-preferences'
import { AgentEffortChips } from '@/layout/components/menu-settings/agent-effort-chips'
import { AgentModelOption } from '@/layout/components/menu-settings/agent-model-option'
import { Typography } from '@/layout/components/ui/typography'
import { RotateCw } from 'lucide-react-native'
import { textError } from '@/layout/utils/colors'

type AgentSettingsControlsProps = {
  models: AgentModelOptionType[]
  modelSlug: AgentModelSlug
  effort: AgentEffort
  isSaving: boolean
  hasSaveError: boolean
  onSelectModel: (slug: AgentModelSlug) => void
  onSelectEffort: (effort: AgentEffort) => void
  onRetry: () => void
}

export function AgentSettingsControls({
  models,
  modelSlug,
  effort,
  isSaving,
  hasSaveError,
  onSelectModel,
  onSelectEffort,
  onRetry,
}: AgentSettingsControlsProps) {
  const selectedModel = models.find((model) => model.slug === modelSlug)

  return (
    <View className="gap-3">
      <View className="gap-2">
        {models.map((model) => (
          <AgentModelOption
            key={model.slug}
            label={model.label}
            isSelected={model.slug === modelSlug}
            disabled={isSaving}
            onPress={() => onSelectModel(model.slug)}
          />
        ))}
      </View>

      <View className="gap-2">
        <Typography variant="label-caps" className="text-on-surface-variant">
          {isSaving ? 'Effort · saving…' : 'Effort'}
        </Typography>
        <AgentEffortChips
          efforts={selectedModel?.efforts ?? []}
          value={effort}
          disabled={isSaving}
          onChange={onSelectEffort}
        />
      </View>

      {hasSaveError && (
        <View className="flex-row items-center justify-between gap-3 rounded-xl border border-text-error/30 bg-surface-error px-3.5 py-2.5">
          <Typography variant="body-md" className="text-text-error">
            didn&apos;t save that — try again?
          </Typography>
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            className="flex-row items-center gap-1.5"
          >
            <RotateCw size={12} color={textError} />
            <Typography
              variant="label-caps"
              className="font-mono text-text-error"
            >
              retry
            </Typography>
          </Pressable>
        </View>
      )}
    </View>
  )
}
