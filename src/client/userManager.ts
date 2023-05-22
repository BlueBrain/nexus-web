import { UserManager, WebStorageStateStore } from 'oidc-client';
import { Realm } from '@bbp/nexus-sdk';

import { RootState } from '../shared/store/reducers';

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

  console.log(
    '_________________Valid realms________________',
    JSON.stringify(validRealms)
  );
  console.log(
    '__________________State_______________________',
    JSON.stringify(state)
  );

  const realm: Realm = preferredRealm
    ? validRealms.find(r => r._label === preferredRealm) || validRealms[0]
    : validRealms[0];

  if (!realm || !clientId || !redirectHostName) {
    return undefined;
  }

  const cacheKey = `${realm._label}||${realm._issuer}||${clientId}||${redirectHostName}`;

  userManagerCache.has(cacheKey) ||
    userManagerCache.set(
      cacheKey,
      new UserManager({
        authority: realm._issuer,
        response_type: 'id_token token',
        client_id: clientId,
        redirect_uri: redirectHostName,
        post_logout_redirect_uri: redirectHostName,
        automaticSilentRenew: true,
        silent_redirect_uri: `${redirectHostName}/silent_refresh`,
        loadUserInfo: false,
        userStore: new WebStorageStateStore({ store: window.localStorage }),
        ...realm,
      })
    );

  return userManagerCache.get(cacheKey);
};

export default getUserManager;
