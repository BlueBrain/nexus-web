import { Organization, Project, PaginatedList, Resource } from '@bbp/nexus-sdk-legacy';
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
  actionTypes as resourceActionTypes,
  ResourceActions,
} from '../actions/nexus/resource';
import { FetchableState, createFetchReducer } from './utils';
import { ResourceLink } from '@bbp/nexus-sdk-legacy/lib/Resource/types';
import { linksReducer, LinksState } from './links';

export interface NexusState {
  orgs: FetchableState<PaginatedList<Organization>>;
  activeOrg?: FetchableState<{
    org: Organization;
    projects: PaginatedList<Project>;
  }>;
  activeProject?: FetchableState<Project>;
  activeResource?: FetchableState<{
    resource: Resource;
    dotGraph: string;
  }>;
  links?: LinksState;
}

const initialState: NexusState = {
  orgs: {
    isFetching: false,
    data: { total: 0, index: 0, results: [] },
    error: null,
  },
};

const activeOrgReducer = createFetchReducer(activeOrgActionTypes);
const orgsReducer = createFetchReducer(orgsActionTypes, []);
const projectReducer = createFetchReducer(projectActionTypes);
const resourceReducer = createFetchReducer(resourceActionTypes);

export default function nexusReducer(
  state: NexusState = initialState,
  action: ActiveOrgActions | OrgsActions | ProjectActions | ResourceActions
) {
  if (action.type.startsWith('@@nexus/PROJECT_')) {
    return {
      ...state,
      activeProject: projectReducer(state.activeProject, action),
    };
  }
  if (action.type.startsWith('@@nexus/RESOURCE_')) {
    return {
      ...state,
      activeResource: resourceReducer(state.activeResource, action),
    };
  }
  if (action.type.startsWith('@@nexus/LINKS_')) {
    return {
      ...state,
      links: linksReducer(state.links, action),
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
