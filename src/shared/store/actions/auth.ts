import { Action } from 'redux';

interface SetAuthenticatedAction extends Action {
  type: 'SET_AUTHENTICATED';
  payload: boolean;
}

const setAuthenticated = (
  isAuthenticated: boolean
): SetAuthenticatedAction => ({
  type: 'SET_AUTHENTICATED',
  payload: isAuthenticated,
});

export type AuthActions = SetAuthenticatedAction;

export default {
  setAuthenticated,
};
