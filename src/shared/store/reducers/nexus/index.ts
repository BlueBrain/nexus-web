import {
  Organization,
  Project,
  Resource,
  PaginationSettings,
  PaginatedList,
} from '@bbp/nexus-sdk';
import {
  OrgsActions,
  ResourceActions,
  SchemaActions,
} from '../../actions/nexus';
import projectReducer from './project';
import { FetchableState } from '../utils';

export const DEFAULT_RESOURCE_PAGINATION_SIZE = 20;

export interface NexusState {
  orgs: Organization[];
  orgsFetching?: boolean;
  projectFetching?: boolean;
  projectsFetching?: boolean;
  resourcesFetching?: boolean;
  schemasFetching?: boolean;
  resourcePaginationSettings: PaginationSettings;
  schemas?: any;
  types?: any;
  activeOrg?: {
    org: Organization;
    projects: Project[];
  };
  project?: FetchableState<Project>;
}

const DEFAULT_PAGINATION_SETTINGS = {
  from: 0,
  size: DEFAULT_RESOURCE_PAGINATION_SIZE,
};

const initialState: NexusState = {
  resourcePaginationSettings: DEFAULT_PAGINATION_SETTINGS,
  orgs: [],
};

export default function nexusReducer(
  state: NexusState = initialState,
  action: OrgsActions | ResourceActions | SchemaActions
) {
  if (action.type.indexOf('@@nexus/PROJECT_') >= 0) {
    return { ...state, project: projectReducer(state.project, action) };
  }

  switch (action.type) {
    case '@@nexus/ORGS_FETCHING':
      return { ...state, orgsFetching: true };
    case '@@nexus/ORG_FETCHING':
      return { ...state, orgFetching: true };
    case '@@nexus/PROJECTS_FETCHING':
      return { ...state, projectsFetching: true };
    case '@@nexus/PROJECT_FETCHING':
      return { ...state, projectFetching: true };
    case '@@nexus/RESOURCES_FETCHING':
      return { ...state, resourcesFetching: true };
    case '@@nexus/RESOURCES_FETCHING_FAILURE':
      return { ...state, resourcesFetching: false };
    case '@@nexus/SCHEMAS_FETCHING':
      return { ...state, schemasFetching: true };
    case '@@nexus/SCHEMAS_FETCHING_FAILURE':
      return { ...state, schemasFetching: false };
    case '@@nexus/ORGS_FETCHING_FAILURE':
      return { ...state, orgsFetching: false };
    case '@@nexus/ORGS_FETCHING_SUCCESS':
      return { ...state, orgsFetching: false, orgs: action.payload };
    case '@@nexus/ORG_FETCHING_FAILURE':
      return { ...state, orgFetching: false };
    case '@@nexus/ORG_FETCHING_SUCCESS':
      return {
        ...state,
        orgFetching: false,
        activeOrg: {
          org: action.payload,
        },
      };
    case '@@nexus/PROJECTS_FETCHING_SUCCESS':
      return {
        ...state,
        projectsFetching: false,
        activeOrg: {
          org: action.payload.org,
          projects: action.payload.projects,
        },
      };
    case '@@nexus/PROJECT_FETCHING_FAILURE':
      return { ...state, projectFetching: false };
    case '@@nexus/PROJECT_FETCHING_SUCCESS':
      return {
        ...state,
        projectFetching: false,
        activeOrg: {
          org: action.payload.org,
        },
        activeProject: {
          project: action.payload.project,
        },
      };
    case '@@nexus/RESOURCES_FETCHING_SUCCESS':
      return {
        ...state,
        resourcesFetching: false,
        resourcePaginationSettings: action.payload.resourcePaginationSettings,
        activeProject: {
          org: action.payload.org,
          project: action.payload.project,
        },
      };
    case '@@nexus/SCHEMAS_FETCHING_SUCCESS':
      return {
        ...state,
        schemasFetching: false,
        schemas: action.payload.schemas,
        types: action.payload.types,
      };
    default:
      return state;
  }
}
