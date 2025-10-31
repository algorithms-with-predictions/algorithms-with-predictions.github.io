import React from 'react';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from './src/utils/createEmotionCache';

require('prismjs/themes/prism-solarizedlight.css');

const clientCache = createEmotionCache();

export const wrapRootElement = ({ element }) => (
  <CacheProvider value={clientCache}>{element}</CacheProvider>
);
