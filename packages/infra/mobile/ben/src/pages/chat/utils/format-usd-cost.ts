import { LANGUAGE_LOCALES, type Language } from '@/core/languages'

const MIN_VISIBLE_COST = 0.0001

function formatCurrency(value: number, language: Language): string {
  return new Intl.NumberFormat(LANGUAGE_LOCALES[language], {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value)
}

export function formatUsdCost(value: number, language: Language): string {
  if (value > 0 && value < MIN_VISIBLE_COST) {
    return `< ${formatCurrency(MIN_VISIBLE_COST, language)}`
  }
  return formatCurrency(value, language)
}
