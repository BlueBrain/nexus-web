import { Resource } from '@bbp/nexus-sdk/es';
import { ActionCreator, AnyAction, Dispatch } from 'redux';
import { ThunkAction } from '..';
import { ResultTableFields } from '../../types/search';
import { RootState } from '../reducers';
import {
  FacetConfig,
  SearchConfig,
  SearchConfigType,
} from '../reducers/search';
import { FetchAction, FetchFailedAction, FetchFulfilledAction } from './utils';

export const enum SearchActionTypes {
  SEARCH_CONFIG_FETCHING = '@@nexus/SEARCH_CONFIG_FETCHING',
  SEARCH_CONFIG_FULFILLED = '@@nexus/SEARCH_CONFIG_FULFILLED',
  SEARCH_CONFIG_FAILED = '@@nexus/SEARCH_CONFIG_FAILED',
}

export const enum SearchPreferenceTypes {
  SEARCH_PREFERENCE_SET = '@@nexus/SEARCH_PREFERENCE_SET',
}
/**
 * SearchConfig
 */

// Fetching
export type FetchSearchConfigsAction = FetchAction<
  SearchActionTypes.SEARCH_CONFIG_FETCHING
>;
const fetchSearchConfigsAction: ActionCreator<FetchSearchConfigsAction> = () => ({
  type: SearchActionTypes.SEARCH_CONFIG_FETCHING,
});

// Fulfilled
export type FetchSearchConfigsFulfilledAction = FetchFulfilledAction<
  SearchActionTypes.SEARCH_CONFIG_FULFILLED,
  SearchConfig[]
>;
const fetchSearchFulfilledAction: ActionCreator<FetchSearchConfigsFulfilledAction> = (
  searchConfigs: SearchConfig[]
) => ({
  type: SearchActionTypes.SEARCH_CONFIG_FULFILLED,
  payload: searchConfigs,
});

// Failed
export type FetchSearchConfigsFailedAction = FetchFailedAction<
  SearchActionTypes.SEARCH_CONFIG_FAILED
>;
const fetchSearchConfigFailedAction: ActionCreator<FetchFailedAction<
  SearchActionTypes.SEARCH_CONFIG_FAILED
>> = (error: Error) => ({
  error,
  type: SearchActionTypes.SEARCH_CONFIG_FAILED,
});

// SEARCH PREFERENCE
export type SetSearchPreference = AnyAction & {
  type: SearchPreferenceTypes.SEARCH_PREFERENCE_SET;
  payload: string;
};
export const setSearchPreference: ActionCreator<SetSearchPreference> = (
  searchPreference: string
) => ({
  payload: searchPreference,
  type: SearchPreferenceTypes.SEARCH_PREFERENCE_SET,
});

export const SEARCH_PREFERENCE_LOCAL_STORAGE_KEY = 'nexusSearchPreference';
export const SEARCH_PREFENCE_LOCAL_STORAGE_KEY = 'nexusSearchPreference';

export const setSearchPreferenceToLocalStore: ActionCreator<ThunkAction> = (
  searchPreference: string
) => {
  return async (dispatch: Dispatch<any>): Promise<SetSearchPreference> => {
    localStorage.setItem(SEARCH_PREFERENCE_LOCAL_STORAGE_KEY, searchPreference);
    return dispatch(setSearchPreference(searchPreference));
  };
};

export const fetchSearchConfigs: ActionCreator<ThunkAction> = () => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<
    FetchSearchConfigsFulfilledAction | FetchSearchConfigsFailedAction
  > => {
    dispatch(fetchSearchConfigsAction());
    try {
      const {
        config: {
          searchSettings: { searchConfigProject },
        },
      } = getState() as RootState;

      const queryNexusForSearchConfigs = async () => {
        const [orgLabel, projectLabel] = searchConfigProject.split('/');
        const { _results } = await nexus.Resource.list(orgLabel, projectLabel, {
          type: SearchConfigType,
        });

        const searchConfigs = await Promise.all(
          _results.map(
            async ({ '@id': id }) =>
              (await nexus.Resource.get(
                orgLabel,
                projectLabel,
                encodeURIComponent(id)
              )) as Resource
          ) as Promise<
            Resource<{
              label: String;
              view: string;
              description?: string;
              fields?: ResultTableFields[];
              facets?: FacetConfig[];
            }>
          >[]
        );

        return searchConfigs.map(resource => ({
          id: resource['@id'],
          label: resource.label,
          view: resource.view,
          description: resource.description,
          fields: resource.fields
            ? Array.isArray(resource.fields)
              ? resource.fields
              : [resource.fields]
            : [],
          facets: resource.facets
            ? Array.isArray(resource.facets)
              ? resource.facets
              : [resource.facets]
            : [],
        }));
      };

      const searchConfigs = await queryNexusForSearchConfigs();
      return dispatch(fetchSearchFulfilledAction(searchConfigs));
    } catch (error) {
      return dispatch(fetchSearchConfigFailedAction(error));
    }
  };
};

/**
 * Export ALL types
 */
export type SearchConfigActions =
  | FetchSearchConfigsAction
  | FetchSearchConfigsFulfilledAction
  | FetchSearchConfigsFailedAction;
export type SearchPreferenceActions = SetSearchPreference;
