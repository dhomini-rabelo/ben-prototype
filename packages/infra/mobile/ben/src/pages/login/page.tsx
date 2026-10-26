import { Linking, View } from 'react-native'
import { BenLogo } from '@/layout/components/icons/ben-logo'
import { GoogleIcon } from '@/layout/components/icons/google-icon'
import { Button } from '@/layout/components/ui/button'
import { Typography } from '@/layout/components/ui/typography'
import { useDevAuth } from '@/layout/hooks/use-dev-auth'
import { useGoogleAuth } from '@/layout/hooks/use-google-auth'
import { useStrings } from '@/layout/hooks/use-strings'
import { onPrimary } from '@/layout/utils/colors'
import { loginStrings } from './strings/login-strings'

export function Login() {
  const {
    signIn,
    isAvailable: isGoogleAvailable,
    isLoading,
    isExtendedWait,
    isPermissionDenied,
    error,
  } = useGoogleAuth()
  const devAuth = useDevAuth()
  const strings = useStrings(loginStrings)
  const footerLinks = [
    { label: strings.privacyPolicy, url: '#' },
    { label: strings.termsOfService, url: '#' },
    { label: strings.helpCenter, url: '#' },
  ]

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <View className="w-full max-w-[320px] items-center gap-8">
        <View className="items-center gap-3">
          <BenLogo variant="brand" />
          <Typography variant="wordmark" className="text-ink">
            Ben
          </Typography>
          <Typography
            variant="tagline"
            className="max-w-[280px] text-center text-secondary"
          >
            {strings.tagline}
          </Typography>
        </View>

        <View className="w-full gap-3">
          {isPermissionDenied && (
            <View
              accessibilityRole="alert"
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3"
            >
              <Typography variant="body-md" className="text-on-surface-variant">
                {strings.permissionDenied}
              </Typography>
            </View>
          )}
          {error !== '' && (
            <Typography variant="body-md" className="text-center text-error">
              {error}
            </Typography>
          )}
          {isGoogleAvailable && (
            <Button className="w-full" onPress={signIn} disabled={isLoading}>
              <GoogleIcon
                className="size-5 text-on-primary"
                color={onPrimary}
              />
              {isLoading ? strings.signingIn : strings.continueWithGoogle}
            </Button>
          )}
          {isExtendedWait && (
            <Typography
              variant="body-md"
              className="text-center text-secondary"
            >
              {strings.waitingOnGoogle}
            </Typography>
          )}
          {devAuth.isAvailable && (
            <Typography
              variant="body-md"
              className="text-center font-medium text-secondary"
              onPress={() => {
                void devAuth.signIn()
              }}
            >
              {strings.devSignIn}
            </Typography>
          )}
        </View>

        <View className="items-center gap-2 pt-2">
          <Typography
            variant="label-caps"
            className="font-sans normal-case tracking-normal text-secondary"
          >
            {strings.copyright}
          </Typography>
          <View className="flex-row items-center gap-4">
            {footerLinks.map((link) => (
              <Typography
                key={link.label}
                variant="label-caps"
                className="font-medium text-on-surface"
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
