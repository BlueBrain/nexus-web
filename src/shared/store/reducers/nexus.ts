import { Organization, Project } from '@bbp/nexus-sdk';
import { OrgsActions, ResourceActions, SchemaActions } from '../actions/nexus';
import { actionTypes as activeOrgActionTypes } from '../actions/nexus/activeOrg';
import { actionTypes as orgsActionTypes } from '../actions/nexus/orgs';
import { actionTypes as projectActionTypes } from '../actions/nexus/projects';
import {
  FetchableState,
  createFetchListReducer,
  createFetchReducer,
} from './utils';

export interface NexusState {
  orgs: FetchableState<Organization[]>;
  activeOrg?: {
    org: FetchableState<Organization>;
    projects: FetchableState<Project[]>;
  };
  activeProject?: FetchableState<Project>;
}

const initialState: NexusState = {
  orgs: {
    isFetching: false,
    data: [],
    error: null,
  },
};

const activeOrgReducer = createFetchReducer(activeOrgActionTypes);
const orgsReducer = createFetchListReducer(orgsActionTypes);
const projectReducer = createFetchReducer(projectActionTypes);

export default function nexusReducer(
  state: NexusState = initialState,
  action: OrgsActions | ResourceActions | SchemaActions
) {
  if (action.type.startsWith('@@nexus/PROJECT_')) {
    return {
      ...state,
      activeProject: projectReducer(state.activeProject, action),
    };
  }

  if (action.type.startsWith('@@nexus/ORG_')) {
    return { ...state, activeOrg: activeOrgReducer(state.activeOrg, action) };
  }

  if (action.type.startsWith('@@nexus/ORGS_')) {
    return { ...state, orgs: orgsReducer(state.orgs, action) };
  }
  return state;
}
