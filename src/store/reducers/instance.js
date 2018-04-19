import * as types from '../actions/types'

export default function instance (state = {
  pending: false,
  data: null,
  error: null
}, action) {
  switch (action.type) {

    case types.FETCH_INSTANCE_STARTED:
      return Object.assign({}, state, {
        pending: true,
        data: null
      });

    case types.FETCH_INSTANCE_FULFILLED:
      return Object.assign({}, state, {
        pending: false,
        data: action.payload
      });

    case types.FETCH_INSTANCE_FAILED:
      return Object.assign({}, state, {
        pending: false,
        data: null,
        error: action.error
      });

    case types.INSTANCE_LINKS_ADDED:
      return Object.assign({}, state, {
        data: {
          ...state.data,
          resolvedLinks: action.payload
        }
      });

    default:
      return state;
  }
}
