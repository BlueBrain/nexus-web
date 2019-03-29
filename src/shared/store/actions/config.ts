import { Action } from 'redux';
import { CookieStorage } from 'cookie-storage';

const cookieStorage = new CookieStorage();

interface SetPreferredRealmAction extends Action {
  type: '@@nexus/CONFIG_SET_REALM';
  name: string;
}

const setPreferredRealm = (name: string): SetPreferredRealmAction => {
  cookieStorage.setItem('nexus__realm', name);
  return {
    name,
    type: '@@nexus/CONFIG_SET_REALM',
  };
};

export type ConfigActions = SetPreferredRealmAction;

export { setPreferredRealm };
