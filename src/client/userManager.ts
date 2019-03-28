import Oidc, { UserManager, WebStorageStateStore, User } from 'oidc-client';
import { CookieStorage } from 'cookie-storage';

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
  automaticSilentRenew: true,
  silent_redirect_uri: 'http://localhost:8000/silent_refresh',
});

export default userManager;
