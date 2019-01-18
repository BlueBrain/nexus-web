import { Action, ActionCreator, Dispatch } from 'redux';
import { PaginatedList } from '@bbp/nexus-sdk';
import { ElasticSearchHit } from '@bbp/nexus-sdk/lib/View/ElasticSearchView';
import { SparqlViewQueryResponse } from '@bbp/nexus-sdk/lib/View/SparqlView';
import { ThunkAction } from '..';

//
// Action types
//
interface RawQueryAction extends Action {
  type: '@@rawQuery/QUERYING';
  query: string;
}
interface RawQueryActionSuccess extends Action {
  type: '@@rawQuery/QUERYING_SUCCESS';
  payload: any;
}
interface RawQueryActionFailure extends Action {
  type: '@@rawQuery/QUERYING_FAILURE';
}

const rawQueryAction: ActionCreator<RawQueryAction> = (query: string) => ({
  query,
  type: '@@rawQuery/QUERYING',
});
const rawQuerySuccessAction: ActionCreator<RawQueryActionSuccess> = (
  results: any
) => ({
  type: '@@rawQuery/QUERYING_SUCCESS',
  payload: results,
});
const rawQueryFailureAction: ActionCreator<RawQueryActionFailure> = (
  error: any
) => ({
  error,
  type: '@@rawQuery/QUERYING_FAILURE',
});

export type RawQueryActions =
  | RawQueryAction
  | RawQueryActionSuccess
  | RawQueryActionFailure;

export const executeRawQuery: ActionCreator<ThunkAction> = (orgName: string, projectName: string, query: string) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<RawQueryActionSuccess | RawQueryActionFailure> => {
    dispatch(rawQueryAction());
    try {
      const org = await nexus.getOrganization(orgName);
      const project = await org.getProject(projectName);
      const sparqlView = await project.getSparqlView();
      const response = await sparqlView.query(query);
      const results: SparqlViewQueryResponse = response;
      return dispatch(rawQuerySuccessAction(results));
    } catch (e) {
      console.log("error", e);
      return dispatch(rawQueryFailureAction(e));
    }
  };
};

export const executeRawElasticSearchQuery: ActionCreator<ThunkAction> = (orgName: string, projectName: string, viewId: string | undefined, query: string) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<RawQueryActionSuccess | RawQueryActionFailure> => {
    dispatch(rawQueryAction());
    try {
      const org = await nexus.getOrganization(orgName);
      const project = await org.getProject(projectName);
      const view = await project.getElasticSearchView(viewId);
      const response = await view.rawQuery(JSON.parse(query));
      const results: PaginatedList<ElasticSearchHit> = response;
      return dispatch(rawQuerySuccessAction(results));
    } catch (e) {
      console.log("error", e);
      return dispatch(rawQueryFailureAction(e));
    }
  };
};
