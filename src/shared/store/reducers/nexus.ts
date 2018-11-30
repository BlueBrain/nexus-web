import { Organization, Project } from '@bbp/nexus-sdk';
import { OrgsActions } from '../actions/nexus';

export interface NexusState {
  fetching: boolean;
  orgs: Organization[];
  activeOrg?: {
    org: Organization;
    projects: Project[];
  };
  // activeProject? {
  //   project: Project;
  //   resources: Resource[];
  // };
}

const initialState: NexusState = {
  fetching: false,
  orgs: [],
};

export default function nexusReducer(
  state: NexusState = initialState,
  action: OrgsActions
) {
  switch (action.type) {
    case '@@nexus/ORGS_FETCHING':
      return { ...state, fetching: true };
    case '@@nexus/ORGS_FETCHING_FAILURE':
      return { ...state, fetching: false };
    case '@@nexus/ORGS_FETCHING_SUCCESS':
      return { ...state, fetching: false, orgs: action.payload };
    case '@@nexus/ORG_FETCHING_SUCCESS':
      return {
        ...state,
        fetching: false,
        activeOrg: {
          org: action.payload.org,
          projects: action.payload.projects,
        },
      };
    default:
      return state;
  }
}
