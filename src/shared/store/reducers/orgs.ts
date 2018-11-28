import { OrgsActions } from '../actions/orgs';
import { Organization, Project } from '@bbp/nexus-sdk';

export interface OrgsState {
  fetching: boolean;
  orgs: Organization[];
  activeOrg?: {
    org: Organization;
    projects?: Project[];
  };
}

const initialState: OrgsState = {
  fetching: false,
  orgs: [],
};

export default function orgsReducer(
  state: OrgsState = initialState,
  action: OrgsActions
) {
  switch (action.type) {
    case 'ORGS_FETCHING':
      return { ...state, fetching: true };
    case 'ORGS_FETCHING_FAILURE':
      return { ...state, fetching: false };
    case 'ORGS_FETCHING_SUCCESS':
      return { ...state, fetching: false, orgs: action.payload };
    case 'ORG_FETCHING_SUCCESS':
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
