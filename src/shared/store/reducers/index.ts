import auth, { AuthState } from './auth';
import config, { ConfigState } from './config';
import nexus, { NexusState } from './nexus';
import rawQuery, { RawQueryState, rawElasticSearchQueryReducer, RawElasticSearchQueryState } from './rawQuery';
import { StaticRouterProps } from 'react-router';

export interface RootState {
  auth: AuthState;
  config: ConfigState;
  nexus?: NexusState;
  router?: StaticRouterProps;
  rawQuery?: RawQueryState;
  rawElasticSearchQuery?: RawElasticSearchQueryState;
}

export default {
  auth,
  config,
  nexus,
  rawQuery,
  rawElasticSearchQuery: rawElasticSearchQueryReducer,
};
