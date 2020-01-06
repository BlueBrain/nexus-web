import { ConfigActions } from '../actions/config';

export interface ConfigState {
  apiEndpoint: string;
  basePath: string;
  clientId: string;
  redirectHostName: string;
  preferredRealm?: string;
  sentryDsn?: string;
  pluginsPath: string;
  plugins: string[];
}

const initialState: ConfigState = {
  apiEndpoint: '/',
  basePath: '',
  clientId: '',
  redirectHostName: '',
  pluginsPath: '/public/plugins',
  plugins: [],
};

export default function configReducer(
  state: ConfigState = initialState,
  action: ConfigActions
): ConfigState {
  switch (action.type) {
    case '@@nexus/CONFIG_SET_REALM':
      return { ...state, preferredRealm: action.name };
    default:
      return state;
  }
}
