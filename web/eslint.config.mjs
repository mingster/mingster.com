import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
	...coreWebVitals,
	...nextTypescript,
	{
		settings: {
			react: {
				version: "detect",
			},
		},
		rules: {
			// ! TO COMPILE SHADCN EXAMPLES, PLEASE REMOVE AS NEEDED
			//'@next/next/no-html-link-for-pages': 'off',
			"@next/next/no-page-custom-font": "off",
			"@typescript-eslint/no-var-requires": "off",
			"@typescript-eslint/no-unused-vars": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-require-imports": "off",
			"@typescript-eslint/no-unused-expressions": "off",
			"@typescript-eslint/no-empty-object-type": "off",
			"@typescript-eslint/ban-ts-comment": "off",

			"import/no-unresolved": "off",
			"import/no-named-as-default": "off",
			"import/named": "off",
			"import/no-named-as-default-member": "off",
			"newline-before-return": "off",
			"no-unused-vars": "off",
			"no-var": "off",
			"promise/always-return": "off",

			"react/no-unescaped-entities": "off",
			"react/react-in-jsx-scope": "off",
			"react-hooks/exhaustive-deps": "off",
			// New in react-hooks v7 (eslint-config-next 16). 14 existing hits, kept visible as warnings until refactored.
			"react-hooks/set-state-in-effect": "warn",
			"react/display-name": "off",
			"react/prop-types": "off",
			"react/no-unknown-property": "off",
			/*
      'tailwindcss/no-custom-classname': 'off',
      'tailwindcss/migration-from-tailwind-2': 'off',
      'tailwindcss/no-unnecessary-arbitrary-value': 'off',
      'tailwindcss/classnames-order': 'off',
      */
		},
	},
];

export default eslintConfig;
