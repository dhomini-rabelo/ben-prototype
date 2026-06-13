import { LogOut, RotateCw, User, X } from 'lucide-react-native'
import { Image, Pressable, View } from 'react-native'
import { MenuSheet } from '@/layout/components/menu/menu-sheet'
import { Typography } from '@/layout/components/ui/typography'
import { onSurfaceVariant, textError } from '@/layout/utils/colors'
import { cn } from '@/layout/utils/styles'

type SettingsVariant = 'populated' | 'loading' | 'error'
type SignOutState = 'idle' | 'pending' | 'failed'

type SettingsSheetProps = {
  variant?: SettingsVariant
  name?: string
  email?: string
  avatarUrl?: string
  signOutState?: SignOutState
  className?: string
  onSignOut?: () => void
  onRetry?: () => void
  onClose?: () => void
}

export function SettingsSheet({
  variant = 'populated',
  name,
  email,
  avatarUrl,
  signOutState = 'idle',
  className,
  onSignOut,
  onRetry,
  onClose,
}: SettingsSheetProps) {
  return (
    <MenuSheet className={className}>
      <View className="flex-row items-center justify-between px-5 pt-1 pb-3">
        <Typography variant="label-caps" className="text-on-surface-variant">
          Settings
        </Typography>
        {onClose ? (
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            className="size-8 items-center justify-center rounded-full active:bg-surface-container-low"
          >
            <X size={16} color={onSurfaceVariant} />
          </Pressable>
        ) : null}
      </View>

      <View className="flex-row items-center gap-3 px-5 pt-1 pb-5">
        {variant === 'loading' ? (
          <>
            <View className="size-12 animate-pulse rounded-full bg-outline-variant/40" />
            <View className="flex-1 gap-2">
              <View className="h-4 w-32 animate-pulse rounded bg-outline-variant/40" />
              <View className="h-3 w-44 animate-pulse rounded bg-outline-variant/30" />
            </View>
          </>
        ) : (
          <>
            <View className="size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-container-high">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="size-full"
                  resizeMode="cover"
                />
              ) : (
                <User size={20} color={onSurfaceVariant} />
              )}
            </View>
            <View className="min-w-0 flex-1">
              {variant === 'populated' && name && (
                <Typography
                  variant="body-md"
                  numberOfLines={1}
                  className="font-semibold text-on-surface"
                >
                  {name}
                </Typography>
              )}
              {email && (
                <Typography
                  variant="label-caps"
                  numberOfLines={1}
                  className="normal-case text-on-surface-variant"
                >
                  {email}
                </Typography>
              )}
              {variant === 'error' && (
                <Typography
                  variant="label-caps"
                  className="normal-case text-on-surface-variant/70"
                >
                  couldn&apos;t load full profile
                </Typography>
              )}
            </View>
          </>
        )}
      </View>

      <View className="px-5">
        <Pressable
          accessibilityRole="button"
          disabled={signOutState === 'pending'}
          onPress={onSignOut}
          className={cn(
            'w-full flex-row items-center justify-between gap-3 rounded-xl border border-outline-variant/50 bg-surface-container-low px-4 py-3',
            signOutState === 'pending' && 'opacity-60',
          )}
        >
          <Typography
            variant="body-md"
            className="font-semibold text-on-surface"
          >
            {signOutState === 'pending' ? 'signing out…' : 'Sign out'}
          </Typography>
          <LogOut size={16} color={onSurfaceVariant} />
        </Pressable>

        {signOutState === 'failed' && (
          <View className="mt-3 flex-row items-center justify-between gap-3 rounded-xl border border-text-error/30 bg-surface-error px-3.5 py-2.5">
            <Typography variant="body-md" className="text-text-error">
              didn&apos;t sign you out — try again?
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
    </MenuSheet>
  )
}
