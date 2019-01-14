import { Action, ActionCreator, Dispatch } from 'redux';
import {
  Organization,
  Project,
  Resource,
  PaginationSettings,
  PaginatedList,
} from '@bbp/nexus-sdk';
import { ThunkAction } from '..';

//
// Action types
//
interface FetchOrgsAction extends Action {
  type: '@@nexus/ORGS_FETCHING';
}
interface FetchProjectsAction extends Action {
  type: '@@nexus/PROJECTS_FETCHING';
}
interface FetchResourcesAction extends Action {
  type: '@@nexus/RESOURCES_FETCHING';
}
interface FetchOrgsActionSuccess extends Action {
  type: '@@nexus/ORGS_FETCHING_SUCCESS';
  payload: Organization[];
}
interface FetchProjectsActionSuccess extends Action {
  type: '@@nexus/PROJECTS_FETCHING_SUCCESS';
  payload: {
    org: Organization;
    projects: Project[];
  };
}
interface FetchResourcesActionSuccess extends Action {
  type: '@@nexus/RESOURCES_FETCHING_SUCCESS';
  payload: {
    org: Organization;
    project: Project;
    resources: Resource[];
    resourcePaginationSettings: PaginationSettings;
  };
}
interface FetchOrgsActionFailure extends Action {
  type: '@@nexus/ORGS_FETCHING_FAILURE';
}
interface FetchProjectsActionFailure extends Action {
  type: '@@nexus/PROJECTS_FETCHING_FAILURE';
}
interface FetchResourcesActionFailure extends Action {
  type: '@@nexus/RESOURCES_FETCHING_FAILURE';
}

const fetchOrgsAction: ActionCreator<FetchOrgsAction> = () => ({
  type: '@@nexus/ORGS_FETCHING',
});
const fetchProjectsAction: ActionCreator<FetchProjectsAction> = () => ({
  type: '@@nexus/PROJECTS_FETCHING',
});
const fetchResourcesAction: ActionCreator<FetchResourcesAction> = () => ({
  type: '@@nexus/RESOURCES_FETCHING',
});
const fetchOrgsSuccessAction: ActionCreator<FetchOrgsActionSuccess> = (
  orgs: Organization[]
) => ({
  type: '@@nexus/ORGS_FETCHING_SUCCESS',
  payload: orgs,
});
const fetchProjectsSuccessAction: ActionCreator<FetchProjectsActionSuccess> = (
  org: Organization,
  projects: Project[]
) => ({
  type: '@@nexus/PROJECTS_FETCHING_SUCCESS',
  payload: { org, projects },
});
const fetchResourcesSuccessAction: ActionCreator<
  FetchResourcesActionSuccess
> = (
  org: Organization,
  project: Project,
  resources: Resource[],
  resourcePaginationSettings: PaginationSettings
) => ({
  type: '@@nexus/RESOURCES_FETCHING_SUCCESS',
  payload: { org, project, resources, resourcePaginationSettings },
});
const fetchOrgsFailureAction: ActionCreator<FetchOrgsActionFailure> = (
  error: any
) => ({
  error,
  type: '@@nexus/ORGS_FETCHING_FAILURE',
});
const fetchProjectsFailureAction: ActionCreator<FetchProjectsActionFailure> = (
  error: any
) => ({
  error,
  type: '@@nexus/PROJECTS_FETCHING_FAILURE',
});
const fetchResourcesFailureAction: ActionCreator<
  FetchResourcesActionFailure
> = (error: any) => ({
  error,
  type: '@@nexus/RESOURCES_FETCHING_FAILURE',
});

export type OrgsActions =
  | FetchOrgsAction
  | FetchOrgsActionSuccess
  | FetchOrgsActionFailure
  | FetchProjectsAction
  | FetchProjectsActionSuccess
  | FetchProjectsActionFailure
  | FetchResourcesAction
  | FetchResourcesActionSuccess
  | FetchResourcesActionFailure;

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

export const fetchProjects: ActionCreator<ThunkAction> = (name: string) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<FetchProjectsActionSuccess | FetchProjectsActionFailure> => {
    dispatch(fetchProjectsAction());
    try {
      const org: Organization = await nexus.getOrganization(name);
      const projects: Project[] = await org.listProjects();
      return dispatch(fetchProjectsSuccessAction(org, projects));
    } catch (e) {
      return dispatch(fetchProjectsFailureAction(e));
    }
  };
};

export const fetchResources: ActionCreator<ThunkAction> = (
  orgLabel: string,
  projectLabel: string,
  resourcePaginationSettings: PaginationSettings
) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<FetchResourcesActionSuccess | FetchResourcesActionFailure> => {
    dispatch(fetchResourcesAction());
    try {
      const org: Organization = await nexus.getOrganization(orgLabel);
      const project: Project = await org.getProject(projectLabel);
      const resources: PaginatedList<Resource> = await project.listResources(
        resourcePaginationSettings
      );
      return dispatch(
        fetchResourcesSuccessAction(
          org,
          project,
          resources,
          resourcePaginationSettings
        )
      );
    } catch (e) {
      return dispatch(fetchResourcesFailureAction(e));
    }
  };
};
