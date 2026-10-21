import { View } from 'react-native'
import { LANGUAGE_LABELS, LANGUAGES, type Language } from '@/core/languages'
import { SegmentedControl } from '@/layout/components/ui/segmented-control'
import { Typography } from '@/layout/components/ui/typography'
import { useLanguage, useStrings } from '@/layout/hooks/use-strings'
import { settingsStrings } from '@/layout/strings/settings-strings'
import { textError } from '@/layout/utils/colors'

const LANGUAGE_OPTIONS = LANGUAGES.map((language) => ({
  value: language,
  label: LANGUAGE_LABELS[language],
}))

type LanguageSectionProps = {
  hasError: boolean
  onSelectLanguage: (language: Language) => void
}

export function LanguageSection({
  hasError,
  onSelectLanguage,
}: LanguageSectionProps) {
  const strings = useStrings(settingsStrings)
  const language = useLanguage()

  return (
    <View className="gap-3 border-t border-outline-variant/40 px-5 pt-4 pb-5">
      <Typography variant="label-caps" className="text-on-surface-variant">
        {strings.languageTitle}
      </Typography>
      <SegmentedControl<Language>
        value={language}
        options={LANGUAGE_OPTIONS}
        onChange={onSelectLanguage}
      />
      {hasError ? (
        <Typography variant="button-text" style={{ color: textError }}>
          {strings.preferenceSaveFailed}
        </Typography>
      ) : null}
    </View>
  )
}
