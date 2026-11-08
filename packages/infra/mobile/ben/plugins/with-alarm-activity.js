/**
 * The alarm screen must open over the lock screen and wake the display.
 *
 * `android/` is generated and gitignored, so the attributes go on `.MainActivity` through this
 * plugin on every prebuild instead of a hand-edit of AndroidManifest.xml.
 */
const { withAndroidManifest } = require('expo/config-plugins')

const MAIN_ACTIVITY = '.MainActivity'

function applyAlarmActivityAttributes(manifest) {
  const application = manifest.manifest.application?.[0]
  const activity = application?.activity?.find(
    (item) => item.$['android:name'] === MAIN_ACTIVITY,
  )
  if (!activity) {
    throw new Error('with-alarm-activity: .MainActivity not found in manifest')
  }
  activity.$['android:showWhenLocked'] = 'true'
  activity.$['android:turnScreenOn'] = 'true'
  return manifest
}

function withAlarmActivity(config) {
  return withAndroidManifest(config, (currentConfig) => {
    currentConfig.modResults = applyAlarmActivityAttributes(
      currentConfig.modResults,
    )
    return currentConfig
  })
}

module.exports = withAlarmActivity
module.exports.applyAlarmActivityAttributes = applyAlarmActivityAttributes
