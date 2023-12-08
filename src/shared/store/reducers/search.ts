import { AnyAction } from 'redux';

import { ResultTableFields } from '../../types/search';
import {
  SearchActionTypes,
  SearchConfigActions,
  SearchPreferenceActions,
  SearchPreferenceTypes,
} from '../actions/search';
import { createFetchReducer, FetchableState } from './utils';

export const SearchConfigType =
  'https://bluebrain.github.io/nexus/vocabulary/SearchConfig';

export enum FacetType {
  TERMS = 'terms',
}

export type FacetConfig = {
  propertyKey: string;
  key: string;
  label: string;
  type: FacetType;
  displayIndex?: number;
};

export type SearchConfig = {
  id: string;
  label: string;
  view: string;
  description?: string;
  fields?: ResultTableFields[];
  facets?: FacetConfig[];
};

export const DEFAULT_SEARCH_STATE = {
  searchConfigs: {
    isFetching: false,
    data: null,
    error: null,
  },
  searchPreference: null,
};

export interface SearchState {
  searchConfigs: FetchableState<SearchConfig[]>;
  searchPreference: string | null;
}

const searchConfigsReducer = createFetchReducer(
  {
    FETCHING: SearchActionTypes.SEARCH_CONFIG_FETCHING,
    FULFILLED: SearchActionTypes.SEARCH_CONFIG_FULFILLED,
    FAILED: SearchActionTypes.SEARCH_CONFIG_FAILED,
  },
  []
);

export default function searchReducer(
  state: SearchState = DEFAULT_SEARCH_STATE,
  action: SearchConfigActions | SearchPreferenceActions | AnyAction
) {
  if (action.type.startsWith('@@nexus/SEARCH_CONFIG')) {
    return {
      ...state,
      searchConfigs: searchConfigsReducer(state.searchConfigs, action),
    };
  }
  if (action.type.startsWith('@@nexus/SEARCH_PREFERENCE')) {
    switch (action.type) {
      case SearchPreferenceTypes.SEARCH_PREFERENCE_SET:
        return {
          ...state,
          searchPreference: (action as SearchPreferenceActions).payload,
        };
    }
  }
  return state;
}
