import { Action, ActionCreator, Dispatch } from 'redux';
import { ThunkAction } from '..';
import { RootState } from '../reducers';
import { SearchConfig, SearchConfigType } from '../reducers/search';
import { FetchAction, FetchFailedAction, FetchFulfilledAction } from './utils';

export enum SearchActionTypes {
  SEARCH_CONFIG_FETCHING = '@@nexus/SEARCH_CONFIG_FETCHING',
  SEARCH_CONFIG_FULFILLED = '@@nexus/SEARCH_CONFIG_FETCHING',
  SEARCH_CONFIG_FAILED = '@@nexus/SEARCH_CONFIG_FETCHING',
}

/**
 * SearchConfig
 */

// Fetching
type FetchSearchConfigsAction = FetchAction<
  SearchActionTypes.SEARCH_CONFIG_FETCHING
>;
const FetchSearchConfigsAction: ActionCreator<FetchSearchConfigsAction> = () => ({
  type: SearchActionTypes.SEARCH_CONFIG_FETCHING,
});

// Fulfilled
type FetchSearchConfigsFulfilledAction = FetchFulfilledAction<
  SearchActionTypes.SEARCH_CONFIG_FULFILLED,
  SearchConfig[]
>;
const fetchSearchFulfilledAction: ActionCreator<FetchSearchConfigsFulfilledAction> = (
  searchConfigs: SearchConfig[]
) => ({
  type: SearchActionTypes.SEARCH_CONFIG_FETCHING,
  payload: searchConfigs,
});

// Failed
type FetchSearchConfigsFailedAction = FetchFailedAction<
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
    dispatch(FetchSearchConfigsAction);
    try {
      const {
        config: {
          searchSetting: { searchConfigProject },
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
