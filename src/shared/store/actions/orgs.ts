import { Action, ActionCreator, Dispatch } from 'redux';
import Nexus, { Organization, Project } from '@bbp/nexus-sdk';
import { Services, ThunkAction } from '..';

//
// Action types
//
interface FetchOrgsAction extends Action {
  type: 'ORGS_FETCHING';
}
interface FetchOrgAction extends Action {
  type: 'ORG_FETCHING';
}
interface FetchOrgsActionSuccess extends Action {
  type: 'ORGS_FETCHING_SUCCESS';
  payload: Organization[];
}
interface FetchOrgActionSuccess extends Action {
  type: 'ORG_FETCHING_SUCCESS';
  payload: {
    org: Organization;
    projects: Project[];
  };
}
interface FetchOrgsActionFailure extends Action {
  type: 'ORGS_FETCHING_FAILURE';
}
interface FetchOrgActionFailure extends Action {
  type: 'ORG_FETCHING_FAILURE';
}

const fetchOrgsAction: ActionCreator<FetchOrgsAction> = () => ({
  type: 'ORGS_FETCHING',
});
const fetchOrgAction: ActionCreator<FetchOrgAction> = () => ({
  type: 'ORG_FETCHING',
});
const fetchOrgsSuccessAction: ActionCreator<FetchOrgsActionSuccess> = (
  orgs: Organization[]
) => ({
  type: 'ORGS_FETCHING_SUCCESS',
  payload: orgs,
});
const fetchOrgSuccessAction: ActionCreator<FetchOrgActionSuccess> = (
  org: Organization,
  projects: Project[]
) => ({
  type: 'ORG_FETCHING_SUCCESS',
  payload: { org, projects },
});
const fetchOrgsFailureAction: ActionCreator<FetchOrgsActionFailure> = (
  error: any
) => ({
  error,
  type: 'ORGS_FETCHING_FAILURE',
});
const fetchOrgFailureAction: ActionCreator<FetchOrgActionFailure> = (
  error: any
) => ({
  error,
  type: 'ORG_FETCHING_FAILURE',
});

export type OrgsActions =
  | FetchOrgsAction
  | FetchOrgsActionSuccess
  | FetchOrgsActionFailure
  | FetchOrgAction
  | FetchOrgActionSuccess
  | FetchOrgActionFailure;

export const fetchOrgs: ActionCreator<ThunkAction> = () => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<FetchOrgsActionSuccess | FetchOrgsActionFailure> => {
    dispatch(fetchOrgsAction());
    try {
      const orgs: Organization[] = await nexus.listOrganizations();
      return dispatch(fetchOrgsSuccessAction(orgs));
    } catch (e) {
      return dispatch(fetchOrgsFailureAction(e));
    }
  };
};

export const fetchOrg: ActionCreator<ThunkAction> = (name: string) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<FetchOrgActionSuccess | FetchOrgActionFailure> => {
    dispatch(fetchOrgsAction());
    try {
      const org: Organization = await nexus.getOrganization(name);
      const projects: Project[] = await org.listProjects();
      return dispatch(fetchOrgSuccessAction(org, projects));
    } catch (e) {
      return dispatch(fetchOrgFailureAction(e));
    }
  };
};
