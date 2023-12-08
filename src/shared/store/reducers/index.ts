import { StaticRouterProps } from 'react-router';
import { UserState } from 'redux-oidc';

import analysisUIReducer from '../../slices/plugins/report';
import auth, { AuthState } from './auth';
import config, { ConfigState } from './config';
import dataExplorerReducer, { TDataExplorerState } from './data-explorer';
import modalsReducer, { modalsState } from './modals';
import searchReducer, { SearchState } from './search';
import uiSettingsReducer, { UISettingsState } from './ui-settings';

export interface RootState {
  auth: AuthState;
  config: ConfigState;
  router?: StaticRouterProps;
  uiSettings: UISettingsState;
  oidc: UserState;
  search: SearchState;
  modals: modalsState;
  dataExplorer: TDataExplorerState;
}

export default {
  auth,
  config,
  analysisUIReducer,
  uiSettings: uiSettingsReducer,
  search: searchReducer,
  modals: modalsReducer,
  dataExplorer: dataExplorerReducer,
};
