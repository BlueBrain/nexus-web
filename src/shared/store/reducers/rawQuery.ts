import { RawQueryActions } from '../actions/rawQuery';
import { SparqlViewQueryResponse } from '@bbp/nexus-sdk/lib/views/SparqlView';

export interface RawQueryState {
  fetching: boolean;
  response: SparqlViewQueryResponse;
}

const initialState: RawQueryState = {
  fetching: false,
  response: {
    head: {
      vars: [],
    },
    results: undefined,
  },
};

export default function rawQueryReducer(
  state: RawQueryState = initialState,
  action: RawQueryActions
) {
  switch (action.type) {
    case '@@rawQuery/QUERYING':
      return { ...state, fetching: true };
    case '@@rawQuery/QUERYING_FAILURE':
      return { ...state, fetching: false };
    case '@@rawQuery/QUERYING_SUCCESS':
      return { ...state, fetching: false, response: action.payload };
    default:
      return state;
  }
}
