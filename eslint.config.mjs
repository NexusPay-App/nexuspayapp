import nextVitals from 'eslint-config-next/core-web-vitals';
export default [
  ...nextVitals,
  { ignores: ['.next/**', 'node_modules/**', 'public/**'] },
  // Retain existing hook migration policy; type checking remains mandatory.
  { rules: { 'react-hooks/exhaustive-deps': 'off', 'react-hooks/set-state-in-effect': 'off', 'react-hooks/refs': 'off', 'react-hooks/purity': 'off', 'react-hooks/immutability': 'off', 'react-hooks/static-components': 'off' } },
];
