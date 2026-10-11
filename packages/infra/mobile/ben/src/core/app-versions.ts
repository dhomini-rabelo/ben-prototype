export type AppVersion = {
  version: string
  date: string
  title: string
  description: string
}

export const APP_VERSIONS = [
  {
    version: '1.1.0',
    date: '2026-10-11',
    title: 'App versions in settings',
    description:
      "Settings now lists recent app versions so you can tell which build you're testing. Tap a version to read what changed.",
  },
  {
    version: '1.0.0',
    date: '2026-05-23',
    title: 'First prototype',
    description:
      "Sign in with Google, talk or type to Ben in the chat, open task workspaces, and pick Ben's model and effort in settings.",
  },
] as const satisfies readonly [AppVersion, ...AppVersion[]]

export const CURRENT_APP_VERSION = APP_VERSIONS[0].version
