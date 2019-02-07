import { Organization, Project, PaginatedList } from '@bbp/nexus-sdk';
import {
  actionTypes as activeOrgActionTypes,
  ActiveOrgActions,
} from '../actions/nexus/activeOrg';
import {
  actionTypes as orgsActionTypes,
  OrgsActions,
} from '../actions/nexus/orgs';
import {
  actionTypes as projectActionTypes,
  ProjectActions,
} from '../actions/nexus/projects';
import {
  FetchableState,
  createFetchListReducer,
  createFetchReducer,
} from './utils';

export interface NexusState {
  orgs: FetchableState<PaginatedList<Organization>>;
  activeOrg?: FetchableState<{ org: Organization; projects: Project[] }>;
  activeProject?: FetchableState<Project>;
}

const initialState: NexusState = {
  orgs: {
    isFetching: false,
    data: { total: 0, index: 0, results: [] },
    error: null,
  },
};

const activeOrgReducer = createFetchReducer(activeOrgActionTypes);
const orgsReducer = createFetchListReducer(orgsActionTypes);
const projectReducer = createFetchReducer(projectActionTypes);

export default function nexusReducer(
  state: NexusState = initialState,
  action: ActiveOrgActions | OrgsActions | ProjectActions
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
