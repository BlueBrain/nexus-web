import * as types from '../actions/types'

export default function instance (state = {
  pending: false,
  data: {
    source: null,
    resolvedLinks: null,
  },
  error: null
}, action) {
  switch (action.type) {

    case types.FETCH_INSTANCE_STARTED:
      return Object.assign({}, state, {
        pending: true,
        data: {
          source: null,
          resolvedLinks: null
        }
      });

    case types.FETCH_INSTANCE_FULFILLED:
      return Object.assign({}, state, {
        pending: false,
        data: {
          source: action.payload,
          resolvedLinks: null
        }
      });

    case types.FETCH_INSTANCE_FAILED:
      return Object.assign({}, state, {
        pending: false,
        data: {
          source: null,
          resolvedLinks: null
        },
        error: action.error
      });

    case types.INSTANCE_LINKS_ADDED:
      return Object.assign({}, state, {
        data: {
          source: state.data.source,
          resolvedLinks: action.payload
        }
      });

    default:
      return state;
  }
}
