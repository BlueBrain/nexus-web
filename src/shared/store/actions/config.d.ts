import { Action, Dispatch } from 'redux';
import { RootState } from '../reducers';
interface SetPreferredRealmAction extends Action {
  type: '@@nexus/CONFIG_SET_REALM';
  name: string;
}
declare function setPreferredRealm(
  name: string
): (dispatch: Dispatch<any>, getState: () => RootState) => Promise<any>;
export declare type ConfigActions = SetPreferredRealmAction;
export { setPreferredRealm };
