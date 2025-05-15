import type { TokenCache, TokenStore } from '@commercetools/ts-client';
import { environment } from '@environments/environment.development';

const tokenCacheAnonym: TokenCache = {
  get: (): TokenStore => {
    const cache = JSON.parse(localStorage.getItem(`anonym_${environment.projectKey}`) || '{}');
    return {
      token: cache.token || '',
      expirationTime: cache.expirationTime || 0,
      refreshToken: cache.refreshToken || '',
      tokenCacheKey: cache.tokenCacheKey || { clientId: '', projectKey: '', host: '' },
    };
  },
  set: (cache: TokenStore) => {
    localStorage.setItem(`anonym_${environment.projectKey}`, JSON.stringify(cache));
  },
};

const tokenCacheAuth: TokenCache = {
  get: (): TokenStore => {
    const cache = JSON.parse(localStorage.getItem(`auth_${environment.projectKey}`) || '{}');
    return {
      token: cache.token || '',
      expirationTime: cache.expirationTime || 0,
      refreshToken: cache.refreshToken || '',
      tokenCacheKey: cache.tokenCacheKey || { clientId: '', projectKey: '', host: '' },
    };
  },
  set: (cache: TokenStore) => {
    localStorage.setItem(`auth_${environment.projectKey}`, JSON.stringify(cache));
  },
};

export { tokenCacheAuth, tokenCacheAnonym };
