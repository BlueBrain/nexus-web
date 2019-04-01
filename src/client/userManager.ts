import { UserManager, WebStorageStateStore } from 'oidc-client';
import { CookieStorage } from 'cookie-storage';
import { RootState } from '../shared/store/reducers';
import { Realm } from '@bbp/nexus-sdk';

const cookieStorage = new CookieStorage();

const getUserManager = (state: RootState): UserManager | undefined => {
  const {
    auth: { realms },
    config: { clientId, redirectHostName, preferredRealm },
  } = state;

  const availableRealms: Realm[] =
    (realms &&
      realms.data &&
      realms.data &&
      realms.data.results &&
      realms.data.results.length > 0 &&
      realms.data.results) ||
    [];

  // if we have a preferred realm, try to find it in the list of available realms
  // otherwise, select first one of the list
  const realm: Realm = preferredRealm
    ? availableRealms.find(r => r.label === preferredRealm) ||
      availableRealms[0]
    : availableRealms[0];

  if (!realm || !clientId || !redirectHostName) {
    return undefined;
  }

  return new UserManager({
    userStore: new WebStorageStateStore({
      store: cookieStorage,
      prefix: 'nexus__',
    }),
    authority: realm.issuer,
    response_type: 'id_token token',
    client_id: clientId,
    redirect_uri: redirectHostName,
    post_logout_redirect_uri: redirectHostName,
    automaticSilentRenew: false,
    silent_redirect_uri: `${redirectHostName}/silent_refresh`,
  });
};

export default getUserManager;
