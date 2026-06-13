import { extendTailwindMerge } from 'tailwind-merge'

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'wordmark',
            'tagline',
            'headline-lg',
            'body-md',
            'button',
            'label-caps',
          ],
        },
      ],
    },
  },
})

type ClassValue = string | number | null | undefined | false

export function cn(...inputs: ClassValue[]): string {
  return twMerge(inputs.filter(Boolean).join(' '))
}
