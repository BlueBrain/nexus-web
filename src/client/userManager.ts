import { UserManager, WebStorageStateStore, User } from 'oidc-client';
import { CookieStorage } from 'cookie-storage';
// import { store } from './index';

const cookieStorage = new CookieStorage();
const userManager = new UserManager({
  userStore: new WebStorageStateStore({
    store: cookieStorage,
    prefix: 'nexus__',
  }),
  authority: 'https://bbp.epfl.ch/nexus/auth/realms/github-dev',
  response_type: 'id_token token',
  client_id: 'nexus-web',
  redirect_uri: 'http://localhost:8000/',
  post_logout_redirect_uri: 'http://localhost:8000/',
  automaticSilentRenew: false,
  silent_redirect_uri: 'http://localhost:8000/silent_refresh',
});

export const getUserManager = (store: any): UserManager | undefined => {
  const {
    auth: { realms },
    config: { clientId, redirectHostName },
  } = store.getState();

  const realm =
    realms.data &&
    realms.data &&
    realms.data.results &&
    realms.data.results.length > 0 &&
    realms.data.results[0];

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
export default userManager;
