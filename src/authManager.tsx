import { Realm } from '@bbp/nexus-sdk/es';
import { WebStorageStateStore, UserManager } from 'oidc-client';
import * as Sentry from '@sentry/browser';
import { RootState } from './shared/store/reducers';
import store from './store';
import {
  loadUser,
  userExpired,
  silentRenewError,
  sessionTerminated,
  userExpiring,
  userSignedOut,
} from 'redux-oidc';
import { fetchIdentitiesFulfilledAction } from 'shared/store/actions/auth';

const userManagerCache: Map<string, UserManager> = new Map();

export const getUserManager = (state: RootState): UserManager | undefined => {
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
  const oidcConfig = Object.freeze({
    authority: realm._issuer,
    response_type: 'id_token token',
    client_id: clientId,
    redirect_uri: redirectHostName,
    post_logout_redirect_uri: redirectHostName,
    automaticSilentRenew: true,
    silent_redirect_uri: `${redirectHostName}/silent_refresh`,
    loadUserInfo: false,
    includeIdTokenInSilentRenew: false,
    // silentRefreshShowIFrame: true,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    ...realm,
  });
  userManagerCache.has(cacheKey) ||
    userManagerCache.set(cacheKey, new UserManager(oidcConfig));
  return userManagerCache.get(cacheKey);
};

export const setupUserSession = async (userManager: UserManager) => {
  // Raised when a user session has been established (or re-established).
  userManager.events.addUserLoaded(async user => {
    loadUser(store, userManager);
    localStorage.setItem('nexus__token', user.access_token);
    const identities = await (
      await fetch(`${store.getState().config.apiEndpoint}/identities`)
    ).json();
    store.dispatch(fetchIdentitiesFulfilledAction(identities));
  });

  // Raised prior to the access token expiring.
  userManager.events.addAccessTokenExpiring(() => {
    store.dispatch(userExpiring());
    userManager
      .signinSilent()
      .then(user => {
        loadUser(store, userManager);
        localStorage.setItem('nexus__token', user.access_token);
      })
      .catch(err => {
        Sentry.captureException(err);
      });
  });

  // Raised after the access token has expired.
  userManager.events.addAccessTokenExpired(() => {
    store.dispatch(userExpired());
    userManager
      .signinSilent()
      .then(user => {
        loadUser(store, userManager);
        localStorage.setItem('nexus__token', user.access_token);
      })
      .catch(err => {
        Sentry.captureException(err);
      });
  });

  // Raised when the automatic silent renew has failed.
  userManager.events.addSilentRenewError((error: Error) => {
    store.dispatch(silentRenewError(error));
    localStorage.removeItem('nexus__token');
  });

  //  Raised when the user's sign-in status at the OP has changed.
  userManager.events.addUserSignedOut(() => {
    store.dispatch(userSignedOut());
    localStorage.removeItem('nexus__token');
  });

  // Raised when a user session has been terminated.
  userManager.events.addUserUnloaded(() => {
    store.dispatch(sessionTerminated());
    localStorage.removeItem('nexus__token');
  });

  // Raised when a user session has been terminated.
  userManager.events.addUserUnloaded(() => {
    store.dispatch(sessionTerminated());
    localStorage.removeItem('nexus__token');
  });

  let user;
  try {
    // do we already have a user?
    user = await userManager.getUser();
  } catch (e) {}

  if (user) {
    // we've loaded a user, refresh it
    try {
      user = await userManager.signinSilent();
    } catch (error) {
      Sentry.captureException(
        'we have loaded a user, refresh it raised an error',
        { extra: { error } }
      );
    }
  } else {
    // nope, are we receiving a new token?
    try {
      user = await userManager.signinRedirectCallback();
    } catch (error) {
      Sentry.captureException(
        'are we receiving a new token? but an error raised',
        { extra: { error } }
      );
    }
  }
};
