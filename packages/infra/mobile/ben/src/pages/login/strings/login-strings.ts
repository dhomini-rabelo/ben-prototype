import type { Localized } from '@/core/languages'

const en = {
  tagline: 'your busy-day brain — say it, Ben files it',
  permissionDenied: "looks like that didn't go through — want to try again?",
  signingIn: 'Signing in...',
  continueWithGoogle: 'Continue with Google',
  waitingOnGoogle: 'still waiting on Google…',
  devSignIn: 'Dev sign-in (Expo Go)',
  copyright: '© 2026 Ben. Your busy-day brain.',
  privacyPolicy: 'Privacy Policy',
  termsOfService: 'Terms of Service',
  helpCenter: 'Help Center',
}

export const loginStrings: Localized<typeof en> = {
  en,
  'pt-BR': {
    tagline: 'o cérebro do seu dia corrido — fale, o Ben organiza',
    permissionDenied: 'parece que não deu certo — quer tentar de novo?',
    signingIn: 'Entrando...',
    continueWithGoogle: 'Continuar com o Google',
    waitingOnGoogle: 'ainda esperando o Google…',
    devSignIn: 'Entrar como dev (Expo Go)',
    copyright: '© 2026 Ben. O cérebro do seu dia corrido.',
    privacyPolicy: 'Política de Privacidade',
    termsOfService: 'Termos de Serviço',
    helpCenter: 'Central de Ajuda',
  },
}
