# Component Variant Map Patterns

How `project-web` components resolve a variant prop to classes or sub-components. Use these patterns when a component exposes a finite set of variants (a typography scale, a tone, an icon kind).

## Map variants with a module-level `Record`

- Define a `Record<{Variant}, string>` (for classes) or `Record<{Variant}, ComponentType<...>>` (for sub-components) at module level, keyed by a string-literal union type that is exported alongside the component.
- Look the variant up in the map inside the component instead of branching with `if`/`switch` in JSX.

```tsx
// Wrong way — variant logic tangled in the render
export function Typography({ variant, children }: TypographyProps) {
  let className = ''
  if (variant === 'wordmark') className = 'text-wordmark'
  else if (variant === 'body-md') className = 'text-body-md'
  return <span className={className}>{children}</span>
}

// Correct way — variant resolved through a map
export type TypographyVariant = 'wordmark' | 'body-md' | 'label-caps'

const variantClasses: Record<TypographyVariant, string> = {
  wordmark: 'text-wordmark',
  'body-md': 'text-body-md',
  'label-caps': 'text-label-caps font-mono uppercase',
}

export function Typography({ variant, className, children }: TypographyProps) {
  return (
    <Component className={cn(variantClasses[variant], className)}>
      {children}
    </Component>
  )
}
```

## Merge the resolved classes with `cn()`

- Combine the variant classes with an optional incoming `className` through the `cn()` helper (from `@/layout/utils/styles`) so callers can extend styling without the map losing precedence.

```tsx
// Correct way
<div className={cn('flex items-center', orientation === 'row' ? 'flex-row gap-2.5' : 'flex-col', className)} />
```
