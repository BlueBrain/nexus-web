import authReducer from '../auth';
import { AuthActionTypes } from '../../actions/auth';

describe('Auth Reducer', () => {
  describe('ACLs', () => {
    it('should be fetching', () => {
      expect(
        authReducer(undefined, { type: AuthActionTypes.ACL_FETCHING })
      ).toEqual({
        authenticated: false,
        acls: {
          isFetching: true,
          data: null,
          error: null,
        },
      });
    });
    it('should return acl data', () => {
      expect(
        authReducer(undefined, {
          type: AuthActionTypes.ACL_FULFILLED,
          payload: { total: 10, index: 0, results: [] },
        })
      ).toEqual({
        authenticated: false,
        acls: {
          isFetching: false,
          data: { total: 10, index: 0, results: [] },
          error: null,
        },
      });
    });
    it('should return an acl error', () => {
      expect(
        authReducer(undefined, {
          type: AuthActionTypes.ACL_FAILED,
          error: new Error('this is awful'),
        })
      ).toEqual({
        authenticated: false,
        acls: {
          isFetching: false,
          data: null,
          error: { message: 'this is awful', name: 'Error' },
        },
      });
    });
  });
});
