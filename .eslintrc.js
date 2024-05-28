module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'extends': [
    'google',
  ],
  'parser': '@typescript-eslint/parser',
  'parserOptions': {
    'ecmaVersion': 'latest',
  },
  'plugins': [
    '@typescript-eslint',
    '@typescript-eslint',
  ],
  'rules': {
    'quotes': ['error', 'single'],
    'linebreak-style': 0,
    'semi': ['error', 'never'],
    'require-jsdoc': 0,
    'camelcase': 0,
    'arrow-parens': ['error', 'always'],
  },
}
