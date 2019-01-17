import { StaticRouterProps } from 'react-router';
import auth, { AuthState } from './auth';
import config, { ConfigState } from './config';
import nexus, { NexusState } from './nexus';
import rawQuery, {
  RawQueryState,
  rawElasticSearchQueryReducer,
  RawElasticSearchQueryState,
} from './rawQuery';
import lists, { ListsByProjectState } from './lists';

export interface RootState {
  auth: AuthState;
  config: ConfigState;
  nexus?: NexusState;
  lists?: ListsByProjectState;
  router?: StaticRouterProps;
  rawQuery?: RawQueryState;
  rawElasticSearchQuery?: RawElasticSearchQueryState;
}

export default {
  auth,
  config,
  nexus,
  rawQuery,
  lists,
  rawElasticSearchQuery: rawElasticSearchQueryReducer,
};
