import { Action, Dispatch } from 'redux';
import { CookieStorage } from 'cookie-storage';
import { RootState } from '../reducers';
import { Realm } from '@bbp/nexus-sdk';

const cookieStorage = new CookieStorage();

interface SetPreferredRealmAction extends Action {
  type: '@@nexus/CONFIG_SET_REALM';
  name: string;
}

function setPreferredRealm(name: string) {
  return async (
    dispatch: Dispatch<any>,
    getState: () => RootState
  ): Promise<any> => {
    const {
      auth: { realms },
      config: { clientId },
    } = getState();
    let realmClientId = '';
    if (realms && realms.data && realms.data.results) {
      // find matching realm
      const realm = realms.data.results.find(realm => realm.name === name);
      if (realm) {
        realmClientId = `${realm.issuer}:${clientId}`;
      }
    }
    const realmKey = encodeURIComponent(`nexus__realm:${realmClientId}`);
    cookieStorage.setItem('nexus__realm', realmClientId);
    return dispatch({
      name: realmKey,
      type: '@@nexus/CONFIG_SET_REALM',
    });
  };
}

export type ConfigActions = SetPreferredRealmAction;

export { setPreferredRealm };
