/**
 * Release signing survives `expo prebuild`.
 *
 * `android/` is generated and gitignored, so a hand-edit to app/build.gradle is lost on the next
 * prebuild — including the Expo template's "release builds are signed with the debug keystore"
 * default, which must not ship. This plugin re-applies the real signing config on every prebuild.
 *
 * The keystore and its password live in `credentials/` (gitignored). When that directory is
 * absent — a fresh clone, or CI without the secret — the build falls back to the debug keystore
 * so `assembleDebug` still works; only release APKs need the real key.
 */
const { existsSync } = require('node:fs')
const { join } = require('node:path')
const { withAppBuildGradle } = require('expo/config-plugins')

const SIGNING_CONFIG = `
        release {
            def keystorePropsFile = rootProject.file('../credentials/keystore.properties')
            if (keystorePropsFile.exists()) {
                def props = new Properties()
                keystorePropsFile.withInputStream { props.load(it) }
                storeFile rootProject.file('../credentials/' + props['BEN_UPLOAD_STORE_FILE'])
                storePassword props['BEN_UPLOAD_STORE_PASSWORD']
                keyAlias props['BEN_UPLOAD_KEY_ALIAS']
                keyPassword props['BEN_UPLOAD_KEY_PASSWORD']
            }
        }`

const DEBUG_CONFIG_ANCHOR = `            keyPassword 'android'
        }`

const TEMPLATE_RELEASE_SIGNING = `            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`

function patch(source) {
  if (!source.includes(DEBUG_CONFIG_ANCHOR)) {
    throw new Error(
      'with-release-signing: signingConfigs.debug block not found in app/build.gradle',
    )
  }
  let output = source.replace(
    DEBUG_CONFIG_ANCHOR,
    DEBUG_CONFIG_ANCHOR + SIGNING_CONFIG,
  )

  const hasReleaseKeystore = existsSync(
    join(__dirname, '..', 'credentials', 'keystore.properties'),
  )
  if (hasReleaseKeystore) {
    if (!output.includes(TEMPLATE_RELEASE_SIGNING)) {
      throw new Error(
        'with-release-signing: buildTypes.release signingConfig not found',
      )
    }
    output = output.replace(
      TEMPLATE_RELEASE_SIGNING,
      '            signingConfig signingConfigs.release',
    )
  }
  return output
}

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (currentConfig) => {
    if (currentConfig.modResults.language !== 'groovy') {
      throw new Error(
        'with-release-signing: expected a groovy app/build.gradle',
      )
    }
    currentConfig.modResults.contents = patch(currentConfig.modResults.contents)
    return currentConfig
  })
}
