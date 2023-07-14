import { UserManager, WebStorageStateStore, Log } from 'oidc-client';
import { Realm } from '@bbp/nexus-sdk';

import { RootState } from '../shared/store/reducers';
import MyResponseValidator from './validator';

const userManagerCache: Map<string, UserManager> = new Map();

const getUserManager = (state: RootState): UserManager | undefined => {
  const {
    auth: { realms },
    config: { clientId, redirectHostName, preferredRealm },
  } = state;
  const availableRealms: Realm[] =
    (realms && realms.data && realms.data._results) || [];

  // if we have a preferred realm, try to find it in the list of available realms
  // otherwise, select first one of the list
  const validRealms = availableRealms.filter(
    r => r._label !== 'serviceaccounts'
  );

  const realm: Realm = preferredRealm
    ? validRealms.find(r => r._label === preferredRealm) || validRealms[0]
    : validRealms[0];

  if (!realm || !clientId || !redirectHostName) {
    return undefined;
  }

  const cacheKey = `${realm._label}||${realm._issuer}||${clientId}||${redirectHostName}`;
  const userManager = new UserManager({
    authority: realm._issuer,
    response_type: 'token',
    client_id: clientId,
    redirect_uri: 'http://localhost:8000/',
    post_logout_redirect_uri: redirectHostName,
    automaticSilentRenew: false,
    silent_redirect_uri: `${redirectHostName}/silent_refresh`,
    loadUserInfo: false,
    scope: 'openid profile email',
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    // @ts-ignore
    ResponseValidatorCtor: MyResponseValidator,
    revokeTokenTypes: ['refresh_token'],
    ...realm,
  });
  userManager.events.addUserLoaded((ev: any) => {
    console.log('@@user loaded', ev);
  });
  userManagerCache.has(cacheKey) || userManagerCache.set(cacheKey, userManager);

  return userManagerCache.get(cacheKey);
};

export default getUserManager;
