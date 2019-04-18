import { UserManager, WebStorageStateStore } from 'oidc-client';
import { CookieStorage } from 'cookie-storage';
import { RootState } from '../shared/store/reducers';
import { Realm } from '@bbp/nexus-sdk';

/**
 * this is a massive hack
 * due to the fact setting up cookies
 * on stag and prod doesn't seems not to work...
 * We set user info on both localstorage and cookies.
 * localstorage is used as a backup.
 * if only localstorage works, then SSR won't render
 * auth views.
 */
const getStorage = () => {
  const cookieStorage = new CookieStorage({
    path: '/',
    secure: true,
  });

  return {
    getItem: (key: string): string | null => {
      let item = null;
      if (typeof window !== 'undefined') {
        item = cookieStorage.getItem(key);
        if (!item) {
          item = localStorage.getItem(key);
        }
      }
      return item;
    },
    setItem: (key: string, value: string): void => {
      if (typeof window !== 'undefined') {
        cookieStorage.setItem(key, value);
        localStorage.setItem(key, value);
      }
    },
    removeItem: (key: string) => {
      if (typeof window !== 'undefined') {
        cookieStorage.removeItem(key);
        localStorage.removeItem(key);
      }
    },
  };
};

const getUserManager = (state: RootState): UserManager | undefined => {
  const storage = getStorage();
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
  const validRealms = availableRealms.filter(
    r => r.label !== 'serviceaccounts'
  );
  const realm: Realm = preferredRealm
    ? validRealms.find(r => r.label === preferredRealm) || validRealms[0]
    : validRealms[0];

  if (!realm || !clientId || !redirectHostName) {
    return undefined;
  }

  return new UserManager({
    userStore: new WebStorageStateStore({
      store: storage,
      prefix: 'nexus__',
    }),
    authority: realm.issuer,
    response_type: 'id_token token',
    client_id: clientId,
    redirect_uri: redirectHostName,
    post_logout_redirect_uri: redirectHostName,
    automaticSilentRenew: false,
    silent_redirect_uri: `${redirectHostName}/silent_refresh`,
    ...realm,
  });
};

export default getUserManager;
