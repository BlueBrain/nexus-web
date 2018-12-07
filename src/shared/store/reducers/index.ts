import auth, { AuthState } from './auth';
import config, { ConfigState } from './config';
import nexus, { NexusState } from './nexus';

export interface RootState {
  auth: AuthState;
  config: ConfigState;
  nexus?: NexusState;
}

export default {
  auth,
  config,
  nexus,
};
