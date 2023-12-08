import { Action, Dispatch } from 'redux';

import { RootState } from '../reducers';

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
    if (realms && realms.data && realms.data._results) {
      // find matching realm
      const realm = realms.data._results.find(realm => realm.name === name);
      if (realm) {
        preferredRealmData = {
          label: realm._label,
          realmKey: `${realm._issuer}:${clientId}`,
        };
      }
    }

    // append config key
    preferredRealmData.realmKey = `nexus__user:${preferredRealmData.realmKey}`;
    localStorage.setItem('nexus__realm', JSON.stringify(preferredRealmData));
    return dispatch({
      name: preferredRealmData.label,
      type: '@@nexus/CONFIG_SET_REALM',
    });
  };
}

export type ConfigActions = SetPreferredRealmAction;

export { setPreferredRealm };
