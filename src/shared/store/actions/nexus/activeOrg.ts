import { ActionCreator, Dispatch } from 'redux';
import { Organization, Project, PaginatedList } from '@bbp/nexus-sdk';
import { ThunkAction } from '../..';
import { FetchAction, FetchFulfilledAction, FetchFailedAction } from '../utils';

enum OrgActionTypes {
  FETCHING = '@@nexus/ORG_FETCHING',
  FULFILLED = '@@nexus/ORG_FETCHING_FULFILLED',
  FAILED = '@@nexus/ORG_FETCHING_FAILED',
}

export const actionTypes = {
  FETCHING: OrgActionTypes.FETCHING,
  FULFILLED: OrgActionTypes.FULFILLED,
  FAILED: OrgActionTypes.FAILED,
};

const fetchOrgAction: ActionCreator<
  FetchAction<OrgActionTypes.FETCHING>
> = () => ({
  type: OrgActionTypes.FETCHING,
});

const fetchOrgFulfilledAction: ActionCreator<
  FetchFulfilledAction<
    OrgActionTypes.FULFILLED,
    { org: Organization; projects: Project[] }
  >
> = (org: Organization, projects: Project[]) => ({
  type: OrgActionTypes.FULFILLED,
  payload: { org, projects },
});

const fetchOrgFailedAction: ActionCreator<
  FetchFailedAction<OrgActionTypes.FAILED>
> = (error: Error) => ({
  error,
  type: OrgActionTypes.FAILED,
});

export type ActiveOrgActions =
  | FetchAction<OrgActionTypes.FETCHING>
  | FetchFulfilledAction<
      OrgActionTypes.FULFILLED,
      { org: Organization; projects: Project[] }
    >
  | FetchFailedAction<OrgActionTypes.FAILED>;

export const fetchOrg: ActionCreator<ThunkAction> = orgName => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<
    | FetchFulfilledAction<
        OrgActionTypes.FULFILLED,
        { org: Organization; projects: Project[] }
      >
    | FetchFailedAction<OrgActionTypes.FAILED>
  > => {
    dispatch(fetchOrgAction());
    try {
      const org: Organization = await Organization.get(orgName);
      const projects: PaginatedList<Project> = await Project.list(orgName, {
        size: 100,
      });
      return dispatch(fetchOrgFulfilledAction(org, projects.results));
    } catch (e) {
      return dispatch(fetchOrgFailedAction(e));
    }
  };
};
