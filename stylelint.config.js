module.exports = {
  extends: ['stylelint-config-tailwindcss'],
  plugins: ['stylelint-declaration-strict-value'],
  rules: {
    'scale-unlimited/declaration-strict-value': [
      [
        'color',
        'background-color',
        'border-color'
      ],
      'ignoreKeywords',
      ['inherit', 'transparent', 'currentColor', 'unset', 'none', 'initial'],
      'ignoreFunctions',
      ['var', 'theme']
    ]
  }
}; 