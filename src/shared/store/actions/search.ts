import { ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from '..';
import { RootState } from '../reducers';
import { SearchConfig, SearchConfigType } from '../reducers/search';
import { FetchAction, FetchFailedAction, FetchFulfilledAction } from './utils';

export const enum SearchActionTypes {
  SEARCH_CONFIG_FETCHING = '@@nexus/SEARCH_CONFIG_FETCHING',
  SEARCH_CONFIG_FULFILLED = '@@nexus/SEARCH_CONFIG_FULFILLED',
  SEARCH_CONFIG_FAILED = '@@nexus/SEARCH_CONFIG_FAILED',
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
        const { _results: searchConfigs } = await nexus.Resource.list(
          orgLabel,
          projectLabel,
          {
            type: SearchConfigType,
          }
        );
        return searchConfigs.map(resource => ({
          label: resource.label,
          view: resource.view,
          description: resource.description,
        }));
      };

      const searchConfigs: SearchConfig[] = await queryNexusForSearchConfigs();
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
