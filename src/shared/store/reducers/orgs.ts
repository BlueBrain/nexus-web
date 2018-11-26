import { OrgsActions } from '../actions/orgs';
import { Organization } from 'nexus-sdk';

export interface OrgsState {
  fetching: boolean;
  orgs: Organization[];
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
    default:
      return state;
  }
}
