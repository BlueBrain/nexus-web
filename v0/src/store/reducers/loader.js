import * as types from "../actions/types";

export default function instance(
  state = {
    requests: 0
  },
  action
) {
  switch (action.type) {
    case types.REQUEST_MADE:
      return Object.assign({}, state, {
        requests: state.requests + 1
      });

    case types.REQUEST_RESOLVED:
      return Object.assign({}, state, {
        requests: state.requests - 1
      });

    default:
      return state;
  }
}
