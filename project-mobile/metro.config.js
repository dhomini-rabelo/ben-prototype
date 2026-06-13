const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

// jotai and zustand ship ESM builds that reference `import.meta.env.MODE`. With
// package exports enabled (the Expo SDK 54 default) Metro resolves those ESM
// builds, and `import.meta` is a syntax error in the classic-script web bundle
// ("Cannot use 'import.meta' outside a module"). Force just these two packages
// to resolve via their legacy `main` field, which points at `import.meta`-free
// CommonJS builds. Everything else keeps package exports.
const PACKAGES_WITHOUT_PACKAGE_EXPORTS = ['jotai', 'zustand']

const defaultResolveRequest = config.resolver.resolveRequest

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const packageRoot = moduleName.split('/')[0]
  if (PACKAGES_WITHOUT_PACKAGE_EXPORTS.includes(packageRoot)) {
    const legacyContext = { ...context, unstable_enablePackageExports: false }
    return legacyContext.resolveRequest(legacyContext, moduleName, platform)
  }
  return (defaultResolveRequest ?? context.resolveRequest)(
    context,
    moduleName,
    platform,
  )
}

module.exports = withNativeWind(config, { input: './src/core/global.css' })
