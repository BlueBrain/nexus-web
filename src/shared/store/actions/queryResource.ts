import { ActionCreator, Dispatch, Action } from 'redux';
import { FetchFulfilledAction, FetchFailedAction } from './utils';
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
import { updateList, makeOrgProjectFilterKey } from './lists';
import { ElasticSearchViewAggregationResponse } from '@bbp/nexus-sdk/lib/View/ElasticSearchView/types';
import { List } from '../reducers/lists';
import { makeESQuery } from './utils/makeESQuery';

export const queryResourcesActionPrefix = 'QUERY';

enum QueryResourcesActionTypes {
  FETCHING = 'QUERY_RESOURCE_FETCHING',
  FULFILLED = 'QUERY_RESOURCE_FULFILLED',
  FAILED = 'QUERY_RESOURCE_FAILED',
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
interface FilterFetchFulfilledAction<T, DATA>
  extends FetchFulfilledAction<T, DATA> {}
interface FilterFetchFailedAction<T> extends FetchFailedAction<T> {}

type FetchQueryAction = FilterFetchAction<QueryResourcesActionTypes.FETCHING>;
type FulfilledQueryAction = FilterFetchFulfilledAction<
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
  schemas: string[];
  types: string[];
}

const queryResourcesFulfilledAction: ActionCreator<FulfilledQueryAction> = (
  filterIndex: number,
  filterKey: string,
  resources: PaginatedList<Resource>,
  schemas: any[],
  types: any[]
) => ({
  filterIndex,
  filterKey,
  type: QueryResourcesActionTypes.FULFILLED,
  payload: {
    resources,
    schemas,
    types,
  },
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

export const queryResources: ActionCreator<ThunkAction> = (
  id: string,
  org: Organization,
  project: Project,
  paginationSettings: PaginationSettings,
  query?: List['query']
) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<
    | FilterFetchFulfilledAction<
        QueryResourcesActionTypes.FULFILLED,
        QueryResourcesFulfilledPayload
      >
    | FilterFetchFailedAction<QueryResourcesActionTypes.FAILED>
  > => {
    const Project = nexus.Project;
    const filterKey = makeOrgProjectFilterKey(org, project);
    const listState = (getState() as RootState).lists;
    const targetWorkspace = listState && listState[filterKey];
    const filterIndex = (targetWorkspace || []).findIndex(
      (list: List) => list.id === id
    );
    const list: List | undefined =
      (!!targetWorkspace && filterIndex >= 0 && targetWorkspace[filterIndex]) ||
      undefined;
    try {
      if (!list) {
        throw new Error(
          `no list found with id ${id} inside project ${project.label}`
        );
      }
      dispatch(queryResourcesFetchAction(filterIndex, filterKey));
      const formattedQuery = makeESQuery(query);
      const realProject = await Project.get(org.label, project.label);
      const defaultElasticSearchView: ElasticSearchView = await realProject.getElasticSearchView();
      const resources: PaginatedList<
        Resource
      > = await defaultElasticSearchView.query(
        formattedQuery,
        paginationSettings
      );
      const aggregationQuery = {
        ...formattedQuery,
        aggs: {
          schemas: {
            terms: {
              size: 999,
              field: '_constrainedBy',
            },
          },
          types: {
            terms: {
              size: 999,
              field: '@type',
            },
          },
        },
      };
      const aggregationResponse: ElasticSearchViewAggregationResponse = await defaultElasticSearchView.aggregation(
        aggregationQuery
      );
      const schemas = aggregationResponse.aggregations.schemas.buckets.map(
        ({ doc_count, key }) => ({ key, count: doc_count })
      );
      const types = aggregationResponse.aggregations.types.buckets.map(
        ({ doc_count, key }) => ({ key, count: doc_count })
      );
      return dispatch(
        queryResourcesFulfilledAction(
          filterIndex,
          filterKey,
          resources,
          schemas,
          types
        )
      );
    } catch (e) {
      return dispatch(queryResourcesFailedAction(filterIndex, filterKey, e));
    }
  };
};
