import js from '@eslint/js'
import prettier from 'eslint-plugin-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const noComments = {
  meta: { type: 'problem', fixable: 'code', schema: [] },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (comment.type === 'Shebang') continue
          context.report({
            loc: comment.loc,
            message: 'Comments are forbidden; write self-explanatory code.',
            fix: (fixer) => fixer.remove(comment),
          })
        }
      },
    }
  },
}

const abbreviatedNames = [
  'e',
  'err',
  'cb',
  'req',
  'res',
  'ctx',
  'idx',
  'i',
  'j',
  'k',
  'tmp',
  'temp',
  'val',
  'obj',
  'arr',
  'fn',
  'msg',
  'cfg',
  'conf',
  'opts',
  'opt',
  'args',
  'arg',
  'param',
  'params',
  'str',
  'num',
  'buf',
  'cur',
  'prev',
  'el',
  'elem',
  'evt',
  'ev',
  'dir',
  'src',
  'dst',
  'dest',
  'ret',
  'rec',
  'acc',
  'cnt',
  'len',
  'pkg',
  'ws',
  'conn',
  'cmd',
  'db',
  'qs',
  'attr',
  'attrs',
  'doc',
  'docs',
  'ref',
  'refs',
  'btn',
  'img',
  'impl',
  'info',
  'calc',
  'init',
  'idxs',
  'ids',
  'pw',
  'pwd',
  'usr',
  'auth',
]
const allowedAbbreviations = new Set([
  'db',
  'ids',
  'info',
  'args',
  'auth',
  'ref',
  'refs',
  'src',
  'doc',
  'docs',
])
export const idDenylist = abbreviatedNames.filter(
  (name) => !allowedAbbreviations.has(name),
)

const backendFiles = [
  'packages/domain/**/*.ts',
  'packages/adapters/**/*.ts',
  'packages/modules/**/*.ts',
  'packages/infra/db/**/*.ts',
  'packages/infra/adapters/**/*.ts',
  'packages/infra/server-ben/**/*.ts',
]
const rootFiles = ['*.{js,mjs,cjs,ts}']
const scopedFiles = [...backendFiles, ...rootFiles]

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/generated/**',
      '**/.tmp/**',
      '**/.claude/**',
      'project-backend/**',
      'project-mobile/**',
      'project-design/**',
      'dist-apk/**',
    ],
  },
  {
    files: scopedFiles,
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: { prettier },
    languageOptions: { globals: { ...globals.node } },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          caughtErrors: 'none',
        },
      ],
      'no-console': 'off',
      quotes: ['error', 'single'],
      'linebreak-style': ['error', 'unix'],
      'prettier/prettier': ['error', { semi: false, singleQuote: true }],
    },
  },
  {
    files: backendFiles,
    plugins: { local: { rules: { 'no-comments': noComments } } },
    rules: {
      'local/no-comments': 'off',
      'id-length': 'off',
      'id-denylist': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
)
