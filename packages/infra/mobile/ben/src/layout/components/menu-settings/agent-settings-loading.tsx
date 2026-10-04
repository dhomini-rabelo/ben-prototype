import { View } from 'react-native'

export function AgentSettingsLoading() {
  return (
    <View className="gap-2">
      <View className="h-12 animate-pulse rounded-xl bg-outline-variant/40" />
      <View className="h-12 animate-pulse rounded-xl bg-outline-variant/40" />
      <View className="h-12 animate-pulse rounded-xl bg-outline-variant/40" />
      <View className="flex-row flex-wrap gap-2 pt-2">
        <View className="h-8 w-16 animate-pulse rounded-full bg-outline-variant/30" />
        <View className="h-8 w-16 animate-pulse rounded-full bg-outline-variant/30" />
        <View className="h-8 w-16 animate-pulse rounded-full bg-outline-variant/30" />
      </View>
    </View>
  )
}
