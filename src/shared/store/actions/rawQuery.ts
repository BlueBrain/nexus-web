import { Action, ActionCreator, Dispatch, AnyAction } from 'redux';
import {
  PaginatedList,
  PaginationSettings,
  ElasticSearchView,
  SparqlView,
} from '@bbp/nexus-sdk-legacy';
import { ElasticSearchHit } from '@bbp/nexus-sdk-legacy/lib/View/ElasticSearchView/types';
import { SparqlViewQueryResponse } from '@bbp/nexus-sdk-legacy/lib/View/SparqlView/types';
import { ThunkAction } from '..';
import { formatError, RequestError } from './utils/errors';

//
// Action types
//
interface RawQueryAction extends Action {
  type: '@@rawQuery/QUERYING';
  query: string;
  paginationSettings: PaginationSettings;
}
interface RawQueryActionSuccess extends Action {
  type: '@@rawQuery/QUERYING_SUCCESS';
  payload: any;
}
interface RawQueryActionFailure extends Action {
  type: '@@rawQuery/QUERYING_FAILURE';
  error: RequestError;
}
export const resetQueryAction: ActionCreator<AnyAction> = () => ({
  type: '@@rawQuery/RESET',
});
const rawQueryAction: ActionCreator<RawQueryAction> = (
  query: string,
  paginationSettings
) => ({
  query,
  paginationSettings,
  type: '@@rawQuery/QUERYING',
});
const rawQuerySuccessAction: ActionCreator<RawQueryActionSuccess> = (
  results: any
) => ({
  type: '@@rawQuery/QUERYING_SUCCESS',
  payload: results,
});
const rawQueryFailureAction: ActionCreator<RawQueryActionFailure> = (
  error: RequestError
) => ({
  error,
  type: '@@rawQuery/QUERYING_FAILURE',
});

export type RawQueryActions =
  | { type: '@@rawQuery/RESET' }
  | RawQueryAction
  | RawQueryActionSuccess
  | RawQueryActionFailure;

export const executeRawQuery: ActionCreator<ThunkAction> = (
  orgName: string,
  projectName: string,
  viewId: string | undefined,
  query: string
) => {
  return async (
    dispatch: Dispatch<any>
  ): Promise<RawQueryActionSuccess | RawQueryActionFailure> => {
    dispatch(rawQueryAction(query));
    try {
      const sparqlView = await SparqlView.get(orgName, projectName, viewId);
      const response = await sparqlView.query(query);
      const results: SparqlViewQueryResponse = response;
      return dispatch(rawQuerySuccessAction(results));
    } catch (e) {
      return dispatch(rawQueryFailureAction(formatError(e)));
    }
  };
};
