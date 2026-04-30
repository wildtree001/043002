module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  extends: 'standard',
  plugins: [
    'html'
  ],
  'rules': {
    'indent': 0,
    'arrow-parens': 0,
    'generator-star-spacing': 0,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'no-trailing-spaces': 0,
    'no-multiple-empty-lines': 0
  },
  'globals': {
    "$": true,
    "localStorage": true,
    "requestAnimationFrame": true
  }
}
