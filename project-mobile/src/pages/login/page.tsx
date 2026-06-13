import { Linking, View } from 'react-native'
import { BenLogo } from '@/layout/components/icons/ben-logo'
import { GoogleIcon } from '@/layout/components/icons/google-icon'
import { Button } from '@/layout/components/ui/button'
import { Typography } from '@/layout/components/ui/typography'
import { useGoogleAuth } from '@/layout/hooks/use-google-auth'
import { onPrimary, primary } from '@/layout/utils/colors'

const FOOTER_LINKS = [
  { label: 'Privacy Policy', url: '#' },
  { label: 'Terms of Service', url: '#' },
  { label: 'Help Center', url: '#' },
]

export function Login() {
  const { signIn, isLoading, isExtendedWait, isPermissionDenied, error } =
    useGoogleAuth()

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <View className="w-full max-w-[320px] items-center gap-8">
        <View className="items-center gap-3">
          <BenLogo className="text-primary" color={primary} />
          <Typography variant="wordmark" className="text-primary">
            Ben
          </Typography>
          <Typography
            variant="tagline"
            className="max-w-[280px] text-center text-secondary"
          >
            your busy-day brain — say it, Ben files it
          </Typography>
        </View>

        <View className="w-full gap-3">
          {isPermissionDenied && (
            <View
              accessibilityRole="alert"
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3"
            >
              <Typography variant="body-md" className="text-on-surface-variant">
                looks like that didn&apos;t go through — want to try again?
              </Typography>
            </View>
          )}
          {error !== '' && (
            <Typography variant="body-md" className="text-center text-error">
              {error}
            </Typography>
          )}
          <Button className="w-full" onPress={signIn} disabled={isLoading}>
            <GoogleIcon className="size-5 text-on-primary" color={onPrimary} />
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>
          {isExtendedWait && (
            <Typography
              variant="body-md"
              className="text-center text-secondary"
            >
              still waiting on Google…
            </Typography>
          )}
        </View>

        <View className="items-center gap-2 pt-2">
          <Typography
            variant="label-caps"
            className="font-sans normal-case tracking-normal text-secondary"
          >
            © 2026 Ben. Your busy-day brain.
          </Typography>
          <View className="flex-row items-center gap-4">
            {FOOTER_LINKS.map((link) => (
              <Typography
                key={link.label}
                variant="label-caps"
                className="font-medium text-primary"
                onPress={() => {
                  void Linking.openURL(link.url)
                }}
              >
                {link.label}
              </Typography>
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}
