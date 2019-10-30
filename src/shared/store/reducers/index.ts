import { StaticRouterProps } from 'react-router';
import { UserState } from 'redux-oidc';
import auth, { AuthState } from './auth';
import config, { ConfigState } from './config';
import rawQuery, {
  RawQueryState,
  rawElasticSearchQueryReducer,
  RawElasticSearchQueryState,
} from './rawQuery';
import uiSettingsReducer, { UISettingsState } from './ui-settings';

export interface RootState {
  auth: AuthState;
  config: ConfigState;
  router?: StaticRouterProps;
  rawQuery?: RawQueryState;
  rawElasticSearchQuery?: RawElasticSearchQueryState;
  uiSettings: UISettingsState;
  oidc: UserState;
}

export default {
  auth,
  config,
  rawQuery,
  rawElasticSearchQuery: rawElasticSearchQueryReducer,
  uiSettings: uiSettingsReducer,
};
