import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'warn' // ⚠️ Make unused vars warnings, not errors
      // 'react-hooks/exhaustive-deps': 'warn', // ⚠️ Optional: Also make useEffect deps warnings
      // '@next/next/no-img-element': 'warn' // ⚠️ Optional: Next.js img element warning as warning
    },
    eslint: {
      // Warning: This allows production builds to successfully complete even if
      // your project has ESLint errors.
      ignoreDuringBuilds: true
    }
  }
];

export default eslintConfig;
