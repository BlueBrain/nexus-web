import { Action, ActionCreator, Dispatch } from 'redux';
import {
  Organization,
  Project,
  Resource,
  PaginationSettings,
  PaginatedList,
  ElasticSearchView,
} from '@bbp/nexus-sdk';
import { ProjectActions } from '../project';
import { ElasticSearchViewAggregationResponse } from '@bbp/nexus-sdk/lib/View/ElasticSearchView';
import { ThunkAction } from '../..';

//
// Action types
//
interface FetchOrgsAction extends Action {
  type: '@@nexus/ORGS_FETCHING';
}
interface FetchOrgAction extends Action {
  type: '@@nexus/ORG_FETCHING';
}
interface FetchProjectsAction extends Action {
  type: '@@nexus/PROJECTS_FETCHING';
}
interface FetchProjectAction extends Action {
  type: '@@nexus/PROJECT_FETCHING';
}
interface FetchResourcesAction extends Action {
  type: '@@nexus/RESOURCES_FETCHING';
}
interface FetchOrgActionSuccess extends Action {
  type: '@@nexus/ORG_FETCHING_SUCCESS';
  payload: Organization;
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
interface FetchProjectActionSuccess extends Action {
  type: '@@nexus/PROJECT_FETCHING_SUCCESS';
  payload: {
    org: Organization;
    project: Project;
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
interface FetchOrgActionFailure extends Action {
  type: '@@nexus/ORG_FETCHING_FAILURE';
}
interface FetchOrgsActionFailure extends Action {
  type: '@@nexus/ORGS_FETCHING_FAILURE';
}
interface FetchProjectsActionFailure extends Action {
  type: '@@nexus/PROJECTS_FETCHING_FAILURE';
}
interface FetchProjectActionFailure extends Action {
  type: '@@nexus/PROJECT_FETCHING_FAILURE';
}
interface FetchResourcesActionFailure extends Action {
  type: '@@nexus/RESOURCES_FETCHING_FAILURE';
}

export const assignActiveProject: ActionCreator<AssignActiveProject> = (
  org: Organization,
  project: Project
) => ({
  type: '@@nexus/ASSIGN_ACTIVE_PROJECT',
  payload: {
    org,
    project,
  },
});

const fetchOrgsAction: ActionCreator<FetchOrgsAction> = () => ({
  type: '@@nexus/ORGS_FETCHING',
});
const fetchOrgAction: ActionCreator<FetchOrgAction> = () => ({
  type: '@@nexus/ORG_FETCHING',
});
const fetchProjectsAction: ActionCreator<FetchProjectsAction> = () => ({
  type: '@@nexus/PROJECTS_FETCHING',
});
const fetchProjectAction: ActionCreator<FetchProjectAction> = () => ({
  type: '@@nexus/PROJECT_FETCHING',
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
const fetchOrgSuccessAction: ActionCreator<FetchOrgActionSuccess> = (
  org: Organization
) => ({
  type: '@@nexus/ORG_FETCHING_SUCCESS',
  payload: org,
});
const fetchProjectsSuccessAction: ActionCreator<FetchProjectsActionSuccess> = (
  org: Organization,
  projects: Project[]
) => ({
  type: '@@nexus/PROJECTS_FETCHING_SUCCESS',
  payload: { org, projects },
});
const fetchProjectSuccessAction: ActionCreator<FetchProjectActionSuccess> = (
  org: Organization,
  project: Project
) => ({
  type: '@@nexus/PROJECT_FETCHING_SUCCESS',
  payload: { org, project },
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
const fetchOrgFailureAction: ActionCreator<FetchOrgActionFailure> = (
  error: any
) => ({
  error,
  type: '@@nexus/ORG_FETCHING_FAILURE',
});
const fetchProjectsFailureAction: ActionCreator<FetchProjectsActionFailure> = (
  error: any
) => ({
  error,
  type: '@@nexus/PROJECTS_FETCHING_FAILURE',
});
const fetchProjectFailureAction: ActionCreator<FetchProjectActionFailure> = (
  error: any
) => ({
  error,
  type: '@@nexus/PROJECT_FETCHING_FAILURE',
});
const fetchResourcesFailureAction: ActionCreator<
  FetchResourcesActionFailure
> = (error: any) => ({
  error,
  type: '@@nexus/RESOURCES_FETCHING_FAILURE',
});

export type OrgsActions =
  | FetchOrgAction
  | FetchOrgActionSuccess
  | FetchOrgActionFailure
  | FetchOrgsAction
  | FetchOrgsActionSuccess
  | FetchOrgsActionFailure
  | FetchProjectAction
  | FetchProjectActionSuccess
  | FetchProjectActionFailure
  | FetchProjectsAction
  | FetchProjectsActionSuccess
  | FetchProjectsActionFailure
  | FetchResourcesAction
  | FetchResourcesActionSuccess
  | FetchResourcesActionFailure
  | ProjectActions;

export type ResourceActions =
  | FetchResourcesAction
  | FetchResourcesActionSuccess
  | FetchResourcesActionFailure;

// Fetch Schemas!
interface SelectSchema extends Action {
  type: '@@nexus/SELECT_SCHEMA';
  payload: {
    selectedSchema: string;
  };
}

interface FetchSchemasAction extends Action {
  type: '@@nexus/SCHEMAS_FETCHING';
}

interface FetchSchemasActionSuccess extends Action {
  type: '@@nexus/SCHEMAS_FETCHING_SUCCESS';
  payload: {
    schemas: any[];
    types: any[];
  };
}
interface FetchSchemasActionFailure extends Action {
  type: '@@nexus/SCHEMAS_FETCHING_FAILURE';
}

export type SchemaActions =
  | FetchSchemasAction
  | FetchSchemasActionSuccess
  | FetchSchemasActionFailure
  | SelectSchema;

export const selectSchema: ActionCreator<SelectSchema> = selectedSchema => ({
  type: '@@nexus/SELECT_SCHEMA',
  payload: { selectedSchema },
});

const fetchSchemasAction: ActionCreator<FetchSchemasAction> = () => ({
  type: '@@nexus/SCHEMAS_FETCHING',
});

const fetchSchemasSuccessAction: ActionCreator<FetchSchemasActionSuccess> = (
  schemas: any[],
  types: any[]
) => ({
  type: '@@nexus/SCHEMAS_FETCHING_SUCCESS',
  payload: { schemas, types },
});

const fetchSchemasFailureAction: ActionCreator<FetchSchemasActionFailure> = (
  error: any
) => ({
  error,
  type: '@@nexus/SCHEMAS_FETCHING_FAILURE',
});

export const loadProjectViewData: ActionCreator<ThunkAction> = (
  orgLabel: string,
  projectLabel: string
) => {
  return async (dispatch: Dispatch<any>): Promise<any> => {
    dispatch(assignActiveProject(orgLabel, projectLabel));
    dispatch(fetchSchemas(orgLabel, projectLabel));
  };
};

// TODO add types to query
export const fetchSchemas: ActionCreator<ThunkAction> = (
  orgLabel: string,
  projectLabel: string
) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<FetchSchemasActionSuccess | FetchSchemasActionFailure> => {
    dispatch(fetchSchemasAction());
    try {
      const org: Organization = await nexus.getOrganization(orgLabel);
      const project: Project = await org.getProject(projectLabel);
      const defaultElasticSearchView: ElasticSearchView = await project.getElasticSearchView();
      const query = {
        aggs: {
          schemas: {
            terms: {
              size: 50,
              field: '_constrainedBy',
            },
          },
          types: {
            terms: {
              size: 50,
              field: '@type',
            },
          },
        },
      };
      const response: ElasticSearchViewAggregationResponse = await defaultElasticSearchView.aggregation(
        query
      );
      const schemas = response.aggregations.schemas.buckets.map(
        ({ doc_count, key }) => ({ key, count: doc_count })
      );
      const types = response.aggregations.types.buckets.map(
        ({ doc_count, key }) => ({ key, count: doc_count })
      );
      return dispatch(fetchSchemasSuccessAction(schemas, types));
    } catch (e) {
      return dispatch(fetchSchemasFailureAction(e));
    }
  };
};

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

export const fetchOrg: ActionCreator<ThunkAction> = orgName => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<FetchOrgActionSuccess | FetchOrgActionFailure> => {
    dispatch(fetchOrgAction());
    try {
      const org: Organization = await nexus.getOrganization(orgName);
      return dispatch(fetchOrgSuccessAction(org));
    } catch (e) {
      return dispatch(fetchOrgFailureAction(e));
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

export const fetchProject: ActionCreator<ThunkAction> = (
  orgName: string,
  projectName: string
) => {
  return async (
    dispatch: Dispatch<any>,
    getState,
    { nexus }
  ): Promise<FetchProjectActionSuccess | FetchProjectActionFailure> => {
    dispatch(fetchProjectAction());
    try {
      const org: Organization = await nexus.getOrganization(orgName);
      const project: Project = await org.getProject(projectName);
      return dispatch(fetchProjectSuccessAction(org, project));
    } catch (e) {
      return dispatch(fetchProjectFailureAction(e));
    }
  };
};

export const fetchResources: ActionCreator<ThunkAction> = (
  orgLabel: string,
  projectLabel: string,
  resourcePaginationSettings: PaginationSettings,
  query: any = {}
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
      const defaultElasticSearchView: ElasticSearchView = await project.getElasticSearchView();
      const resources: PaginatedList<
        Resource
      > = await defaultElasticSearchView.query(
        query,
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
