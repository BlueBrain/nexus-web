import { ActionCreator, Dispatch, Action } from 'redux';
import { FetchFulfilledAciton, FetchFailedAction } from './utils';
import {
  PaginatedList,
  Resource,
  Organization,
  Project,
  ElasticSearchView,
  PaginationSettings,
} from '@bbp/nexus-sdk';
import { ThunkAction } from '..';
import { RootState } from '../reducers';
import { updateList } from './lists';

export const queryResourcesActionPrefix = 'QUERY';

enum QueryResourcesActionTypes {
  FETCHING = 'QUERY_RESOURCE_FETCHING',
  FULFILLED = 'QUERY_RESOURCE_FULFILLED',
  FAILED = 'QUERY_REOSURCE_FAILED',
}

export const actionTypes = {
  FETCHING: QueryResourcesActionTypes.FETCHING,
  FULFILLED: QueryResourcesActionTypes.FULFILLED,
  FAILED: QueryResourcesActionTypes.FAILED,
};

interface FilterFetchAction<T> extends Action<T> {
  type: T;
  filterIndex: number;
}
interface FilterFetchFulfilledAciton<T, DATA>
  extends FetchFulfilledAciton<T, DATA> {}
interface FilterFetchFailedAction<T> extends FetchFailedAction<T> {}

type FetchQueryAction = FilterFetchAction<QueryResourcesActionTypes.FETCHING>;
type FulfilledQueryAction = FilterFetchFulfilledAciton<
  QueryResourcesActionTypes.FULFILLED,
  QueryResourcesFulfilledPayload
>;
type FailedQueryAction = FilterFetchFailedAction<
  QueryResourcesActionTypes.FAILED
>;

export type QueryActions =
  | FetchQueryAction
  | FulfilledQueryAction
  | FailedQueryAction;

const queryResourcesFetchAction: ActionCreator<FetchQueryAction> = (
  filterIndex: number,
  filterKey: string
) => ({
  filterIndex,
  filterKey,
  type: QueryResourcesActionTypes.FETCHING,
});

interface QueryResourcesFulfilledPayload {
  resources: PaginatedList<Resource>;
  paginationSettings: PaginationSettings;
}

const queryResourcesFulfilledAction: ActionCreator<FulfilledQueryAction> = (
  filterIndex: number,
  filterKey: string,
  resources: PaginatedList<Resource>,
  paginationSettings: PaginationSettings
) => ({
  filterIndex,
  filterKey,
  type: QueryResourcesActionTypes.FULFILLED,
  payload: { resources, paginationSettings },
});

const queryResourcesFailedAction: ActionCreator<FailedQueryAction> = (
  filterIndex: number,
  filterKey: string,
  error: Error
) => ({
  filterIndex,
  filterKey,
  error,
  type: QueryResourcesActionTypes.FAILED,
});

const makeESQuery = (query?: { filters: any; textQuery?: string }) => {
  return {};
};

// TODO make higher order compositional function to add "WithFilterKey" or "WithFilterIndex"
export const queryResources: ActionCreator<ThunkAction> = (
  filterIndex: number,
  filterKey: string,
  orgLabel: string,
  projectLabel: string,
  paginationSettings: PaginationSettings,
  query?: any
) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<
    | FilterFetchFulfilledAciton<
        QueryResourcesActionTypes.FULFILLED,
        QueryResourcesFulfilledPayload
      >
    | FilterFetchFailedAction<QueryResourcesActionTypes.FAILED>
  > => {
    console.log("I'm going to query, man", { paginationSettings, query });
    const listState = (getState() as RootState).lists;
    if (query && listState) {
      const list = (listState as any)[filterKey][filterIndex];
      dispatch(
        updateList(orgLabel + projectLabel, filterIndex, {
          ...list,
          query,
        })
      );
    }
    dispatch(queryResourcesFetchAction(filterIndex, filterKey));
    try {
      if (!projectLabel || !orgLabel) {
        throw new Error('No active org or project');
      }
      const org: Organization = await nexus.getOrganization(orgLabel);
      const project: Project = await org.getProject(projectLabel);
      const defaultElasticSearchView: ElasticSearchView = await project.getElasticSearchView();
      const resources: PaginatedList<
        Resource
      > = await defaultElasticSearchView.query(
        makeESQuery(query),
        paginationSettings
      );
      return dispatch(
        queryResourcesFulfilledAction(
          filterIndex,
          filterKey,
          resources,
          paginationSettings
        )
      );
    } catch (e) {
      console.error(e);
      return dispatch(queryResourcesFailedAction(filterIndex, filterKey, e));
    }
  };
};
