import auth, { AuthState } from './auth';
import config, { ConfigState } from './config';
import nexus, { NexusState } from './nexus';
import { StaticRouterProps } from 'react-router';

export interface RootState {
  auth: AuthState;
  config: ConfigState;
  nexus?: NexusState;
  router?: StaticRouterProps;
}

export default {
  auth,
  config,
  nexus,
};
