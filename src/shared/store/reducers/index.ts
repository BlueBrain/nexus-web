import auth, { AuthState } from './auth';
import config, { ConfigState } from './config';
import orgs, { OrgsState } from './orgs';

export interface RootState {
  auth: AuthState;
  config: ConfigState;
  orgs?: OrgsState;
}

export default {
  auth,
  config,
  orgs,
};
