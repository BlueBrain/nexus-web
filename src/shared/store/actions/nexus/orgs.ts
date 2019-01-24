import { ActionCreator, Dispatch } from 'redux';
import { Organization, Project } from '@bbp/nexus-sdk';
import { ThunkAction } from '../..';
import { FetchAction, FetchFulfilledAction, FetchFailedAction } from '../utils';

enum OrgsActionTypes {
  FETCHING = '@@nexus/ORGS_FETCHING',
  FULFILLED = '@@nexus/ORGS_FETCHING_FULFILLED',
  FAILED = '@@nexus/ORGS_FETCHING_FAILED',
}

export interface OrgPayload extends Organization {
  projectNumber: string;
}

export const actionTypes = {
  FETCHING: OrgsActionTypes.FETCHING,
  FULFILLED: OrgsActionTypes.FULFILLED,
  FAILED: OrgsActionTypes.FAILED,
};

const fetchOrgsAction: ActionCreator<
  FetchAction<OrgsActionTypes.FETCHING>
> = () => ({
  type: OrgsActionTypes.FETCHING,
});

const fetchOrgsFulfilledAction: ActionCreator<
  FetchFulfilledAction<OrgsActionTypes.FULFILLED, OrgPayload[]>
> = (orgs: OrgPayload[]) => ({
  type: OrgsActionTypes.FULFILLED,
  payload: orgs,
});

const fetchOrgsFailedAction: ActionCreator<
  FetchFailedAction<OrgsActionTypes.FAILED>
> = (error: Error) => ({
  error,
  type: OrgsActionTypes.FAILED,
});

export type OrgsActions =
  | FetchAction<OrgsActionTypes.FETCHING>
  | FetchFulfilledAction<OrgsActionTypes.FULFILLED, OrgPayload[]>
  | FetchFailedAction<OrgsActionTypes.FAILED>;

export const fetchOrgs: ActionCreator<ThunkAction> = () => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<
    | FetchFulfilledAction<OrgsActionTypes.FULFILLED, OrgPayload[]>
    | FetchFailedAction<OrgsActionTypes.FAILED>
  > => {
    dispatch(fetchOrgsAction());
    try {
      const orgs: Organization[] = await nexus.listOrganizations();
      const projectsPerOrg = await Promise.all(orgs.map(org => org.listProjects()));
      orgs.map((org, index) => {
        (org as OrgPayload).projectNumber = projectsPerOrg[index].length.toString();
      });
      return dispatch(fetchOrgsFulfilledAction(orgs));
    } catch (e) {
      return dispatch(fetchOrgsFailedAction(e));
    }
  };
};
