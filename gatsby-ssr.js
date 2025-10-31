import React from 'react';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from './src/utils/createEmotionCache';

export const wrapRootElement = ({ element }) => {
  const cache = createEmotionCache();
  return <CacheProvider value={cache}>{element}</CacheProvider>;
};
