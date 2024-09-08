import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
    // {
    //     ignores: [
    //         'node_modules/',
    //         '!node_modules/@ocdla/global-components/',
    //         'dev_modules/',
    //         '!dev_modules/@ocdla/global-components/'
    //     ],
    //     files: [
    //         'node_modules/@ocdla/global-components/*.js',
    //         'node_modules/@ocdla/global-components/*.jsx',
    //         'dev_modules/@ocdla/global-components/*.js',
    //         'dev_modules/@ocdla/global-components/*.jsx'
    //     ]
    // },
    {
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            }
        },
        files: ['**/*.js', '**/*.jsx']
    },
    pluginJs.configs.recommended,
    {
        rules: {
            'import/no-duplicates': 'off',
            'multiline-ternary': 'off',
            'space-before-function-paren': 'off',
            'arrow-parens': ['warn', 'as-needed'],
            'no-undef': 'off',
            'no-constant-condition': 'off',
            'no-tabs': 'warn',
            'no-case-declarations': 'off',
            indent: [
                'warn',
                4,
                {
                    SwitchCase: 1,
                    ignoredNodes: ['ConditionalExpression'],
                    FunctionDeclaration: { parameters: 1 }
                }
            ],
            quotes: ['warn', 'single'],
            semi: ['warn', 'always'],
            'no-useless-concat': 'warn',
            'no-array-constructor': 'warn',
            'no-unused-vars': 'warn',
            eqeqeq: 'warn',
            'no-console': 'warn'
        }
    }
];
