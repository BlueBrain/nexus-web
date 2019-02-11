import { ActionCreator, Dispatch } from 'redux';
import {
  Organization,
  Project,
  PaginatedList,
  PaginationSettings,
} from '@bbp/nexus-sdk';
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
  FetchFulfilledAction<OrgsActionTypes.FULFILLED, PaginatedList<Organization>>
> = (orgs: PaginatedList<Organization>) => ({
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
  | FetchFulfilledAction<OrgsActionTypes.FULFILLED, PaginatedList<Organization>>
  | FetchFailedAction<OrgsActionTypes.FAILED>;

export const fetchOrgs: ActionCreator<ThunkAction> = (
  paginationSettings?: PaginationSettings
) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<
    | FetchFulfilledAction<
        OrgsActionTypes.FULFILLED,
        PaginatedList<Organization>
      >
    | FetchFailedAction<OrgsActionTypes.FAILED>
  > => {
    dispatch(fetchOrgsAction());
    try {
      const orgs: PaginatedList<Organization> = await Organization.list({
        size: (paginationSettings && paginationSettings.size) || 20,
        from: (paginationSettings && paginationSettings.from) || 0,
      });
      const projectsPerOrg: PaginatedList<Project>[] = await Promise.all(
        orgs.results.map(org => Project.list(org.label))
      );
      orgs.results.map((org, index) => {
        (org as OrgPayload).projectNumber = projectsPerOrg[
          index
        ].total.toString();
      });
      return dispatch(fetchOrgsFulfilledAction(orgs));
    } catch (e) {
      return dispatch(fetchOrgsFailedAction(e));
    }
  };
};
