export interface ConfigState {
  apiEndpoint: string;
  basePath: string;
  clientId: string;
  redirectHostName: string;
}

const initialState: ConfigState = {
  apiEndpoint: '/',
  basePath: '',
  clientId: '',
  redirectHostName: '',
};

export default function configReducer(
  state: ConfigState = initialState,
  action = {}
): ConfigState {
  return state;
}
