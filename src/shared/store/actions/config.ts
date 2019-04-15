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
    let preferredRealmData = {
      label: '',
      realmKey: '',
    };
    if (realms && realms.data && realms.data.results) {
      // find matching realm
      const realm = realms.data.results.find(realm => realm.name === name);
      if (realm) {
        preferredRealmData = {
          label: realm.label,
          realmKey: `${realm.issuer}:${clientId}`,
        };
      }
    }
    // append config key
    preferredRealmData.realmKey = `nexus__user:${preferredRealmData.realmKey}`;
    cookieStorage.setItem('nexus__realm', JSON.stringify(preferredRealmData));
    return dispatch({
      name: preferredRealmData.label,
      type: '@@nexus/CONFIG_SET_REALM',
    });
  };
}

export type ConfigActions = SetPreferredRealmAction;

export { setPreferredRealm };
