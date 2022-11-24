import { AnyAction } from 'redux';
import { FetchableState } from './utils';
import {
  SearchConfigActions,
  SearchPreferenceActions,
} from '../actions/search';
import { ResultTableFields } from '../../types/search';
export declare const SearchConfigType =
  'https://bluebrain.github.io/nexus/vocabulary/SearchConfig';
export declare enum FacetType {
  TERMS = 'terms',
}
export declare type FacetConfig = {
  propertyKey: string;
  key: string;
  label: string;
  type: FacetType;
  displayIndex?: number;
};
export declare type SearchConfig = {
  id: string;
  label: string;
  view: string;
  description?: string;
  fields?: ResultTableFields[];
  facets?: FacetConfig[];
};
export declare const DEFAULT_SEARCH_STATE: {
  searchConfigs: {
    isFetching: boolean;
    data: null;
    error: null;
  };
  searchPreference: null;
};
export interface SearchState {
  searchConfigs: FetchableState<SearchConfig[]>;
  searchPreference: string | null;
}
export default function searchReducer(
  state: SearchState | undefined,
  action: SearchConfigActions | SearchPreferenceActions | AnyAction
): {
  searchConfigs: any;
  searchPreference: string | null;
};
