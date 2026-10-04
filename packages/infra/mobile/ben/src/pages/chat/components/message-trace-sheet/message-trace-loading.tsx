import { View } from 'react-native'

export function MessageTraceLoading() {
  return (
    <View className="gap-3 px-5 pb-5">
      <View className="h-8 w-2/3 animate-pulse rounded bg-outline-variant/40" />

      <View className="h-4 w-1/3 animate-pulse rounded bg-outline-variant/40" />
      <View className="h-4 w-full animate-pulse rounded bg-outline-variant/40" />
      <View className="h-4 w-5/6 animate-pulse rounded bg-outline-variant/40" />

      <View className="mt-2 h-4 w-1/3 animate-pulse rounded bg-outline-variant/40" />
      <View className="h-4 w-full animate-pulse rounded bg-outline-variant/40" />
      <View className="h-4 w-5/6 animate-pulse rounded bg-outline-variant/40" />

      <View className="mt-2 h-4 w-1/3 animate-pulse rounded bg-outline-variant/40" />
    </View>
  )
}
