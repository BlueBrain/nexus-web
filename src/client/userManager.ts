import { UserManager, WebStorageStateStore } from 'oidc-client';
import { RootState } from '../shared/store/reducers';
import { Realm } from '@bbp/nexus-sdk';

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
    authority: realm.issuer,
    response_type: 'id_token token',
    client_id: clientId,
    redirect_uri: redirectHostName,
    post_logout_redirect_uri: redirectHostName,
    automaticSilentRenew: true,
    silent_redirect_uri: `${redirectHostName}/silent_refresh`,
    loadUserInfo: false,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    ...realm,
  });
};

export default getUserManager;
