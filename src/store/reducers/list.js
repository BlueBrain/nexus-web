import * as types from '../actions/types'

export default function instance(state = {
  error: null
}, action) {
  switch (action.type) {

    case types.FETCH_LIST_FAILED:

      return Object.assign({}, state, {
        error: action.error
      });

    default:
      return state;
  }
}
