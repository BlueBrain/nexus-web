import { Organization, Project, Resource } from '@bbp/nexus-sdk';
import { OrgsActions } from '../actions/nexus';

export interface NexusState {
  orgs: Organization[];
  orgsFetching?: boolean;
  projectsFetching?: boolean;
  resourcesFetching?: boolean;
  activeOrg?: {
    org: Organization;
    projects: Project[];
  };
  activeProject?: {
    org: Organization;
    project: Project;
    resources: Resource[];
  };
}

const initialState: NexusState = {
  orgs: [],
};

export default function nexusReducer(
  state: NexusState = initialState,
  action: OrgsActions
) {
  switch (action.type) {
    case '@@nexus/ORGS_FETCHING':
      return { ...state, orgsFetching: true };
    case '@@nexus/PROJECTS_FETCHING':
      return { ...state, projectsFetching: true };
    case '@@nexus/RESOURCES_FETCHING':
      return { ...state, resourcesFetching: true };
    case '@@nexus/ORGS_FETCHING_FAILURE':
      return { ...state, orgsFetching: false };
    case '@@nexus/ORGS_FETCHING_SUCCESS':
      return { ...state, orgsFetching: false, orgs: action.payload };
    case '@@nexus/PROJECTS_FETCHING_SUCCESS':
      return {
        ...state,
        projectsFetching: false,
        activeOrg: {
          org: action.payload.org,
          projects: action.payload.projects,
        },
      };
    case '@@nexus/RESOURCES_FETCHING_SUCCESS':
      return {
        ...state,
        resourcesFetching: false,
        activeProject: {
          org: action.payload.org,
          project: action.payload.project,
          resources: action.payload.resources,
        },
      };
    default:
      return state;
  }
}
