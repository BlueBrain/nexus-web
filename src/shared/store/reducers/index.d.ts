import { StaticRouterProps } from 'react-router';
import { UserState } from 'redux-oidc';
import auth, { AuthState } from './auth';
import config, { ConfigState } from './config';
import searchReducer, { SearchState } from './search';
import uiSettingsReducer, { UISettingsState } from './ui-settings';
export interface RootState {
  auth: AuthState;
  config: ConfigState;
  router?: StaticRouterProps;
  uiSettings: UISettingsState;
  oidc: UserState;
  search: SearchState;
}
declare const _default: {
  auth: typeof auth;
  config: typeof config;
  analysisUIReducer: import('@reduxjs/toolkit').Reducer<
    import('../../types/plugins/report').AnalysesState,
    import('@reduxjs/toolkit').AnyAction
  >;
  uiSettings: typeof uiSettingsReducer;
  search: typeof searchReducer;
};
export default _default;
