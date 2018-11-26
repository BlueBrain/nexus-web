export interface ConfigState {
  apiEndpoint: string;
  basePath: string;
}

const initialState: ConfigState = {
  apiEndpoint: '/',
  basePath: '',
};

export default function configReducer(
  state: ConfigState = initialState,
  action = {}
): ConfigState {
  return state;
}
