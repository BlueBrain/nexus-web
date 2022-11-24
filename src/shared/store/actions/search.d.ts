import { ActionCreator, AnyAction } from 'redux';
import { ThunkAction } from '..';
import { SearchConfig } from '../reducers/search';
import { FetchAction, FetchFailedAction, FetchFulfilledAction } from './utils';
export declare const enum SearchActionTypes {
  SEARCH_CONFIG_FETCHING = '@@nexus/SEARCH_CONFIG_FETCHING',
  SEARCH_CONFIG_FULFILLED = '@@nexus/SEARCH_CONFIG_FULFILLED',
  SEARCH_CONFIG_FAILED = '@@nexus/SEARCH_CONFIG_FAILED',
}
export declare const enum SearchPreferenceTypes {
  SEARCH_PREFERENCE_SET = '@@nexus/SEARCH_PREFERENCE_SET',
}
/**
 * SearchConfig
 */
export declare type FetchSearchConfigsAction = FetchAction<
  SearchActionTypes.SEARCH_CONFIG_FETCHING
>;
export declare type FetchSearchConfigsFulfilledAction = FetchFulfilledAction<
  SearchActionTypes.SEARCH_CONFIG_FULFILLED,
  SearchConfig[]
>;
export declare type FetchSearchConfigsFailedAction = FetchFailedAction<
  SearchActionTypes.SEARCH_CONFIG_FAILED
>;
export declare type SetSearchPreference = AnyAction & {
  type: SearchPreferenceTypes.SEARCH_PREFERENCE_SET;
  payload: string;
};
export declare const setSearchPreference: ActionCreator<SetSearchPreference>;
export declare const SEARCH_PREFENCE_LOCAL_STORAGE_KEY =
  'nexusSearchPreference';
export declare const setSearchPreferenceToLocalStore: ActionCreator<ThunkAction>;
export declare const fetchSearchConfigs: ActionCreator<ThunkAction>;
/**
 * Export ALL types
 */
export declare type SearchConfigActions =
  | FetchSearchConfigsAction
  | FetchSearchConfigsFulfilledAction
  | FetchSearchConfigsFailedAction;
export declare type SearchPreferenceActions = SetSearchPreference;
