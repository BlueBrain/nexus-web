import { RawQueryActions } from '../actions/rawQuery';
import { PaginatedList } from '@bbp/nexus-sdk';
import { ElasticSearchHit } from '@bbp/nexus-sdk/lib/View/ElasticSearchView';
import { SparqlViewQueryResponse } from '@bbp/nexus-sdk/lib/View/SparqlView';

export interface RawQueryState {
  fetching: boolean;
  response: SparqlViewQueryResponse;
}

export interface RawElasticSearchQueryState {
  fetching: boolean;
  response: PaginatedList<ElasticSearchHit>;
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

const initialElasticSearchState: RawElasticSearchQueryState = {
  fetching: false,
  response: {
    total: 0,
    results: []
  },
};

export function rawElasticSearchQueryReducer(
  state: RawElasticSearchQueryState = initialElasticSearchState,
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
