import authReducer from '../auth';
import { AuthActionTypes } from '../../actions/auth';

describe('Auth Reducer', () => {
  describe('ACLs', () => {
    it('should be fetching', () => {
      expect(
        authReducer(undefined, { type: AuthActionTypes.ACL_FETCHING })
      ).toEqual({
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
        acls: {
          isFetching: false,
          data: null,
          error: new Error('this is awful'),
        },
      });
    });
  });
  describe('Identities', () => {
    it('should be fetching', () => {
      expect(
        authReducer(undefined, { type: AuthActionTypes.IDENTITY_FETCHING })
      ).toEqual({
        identities: {
          isFetching: true,
          data: [],
          error: null,
        },
      });
    });
    it('should return identity data', () => {
      expect(
        authReducer(undefined, {
          type: AuthActionTypes.IDENTITY_FULFILLED,
          payload: [{ '@type': 'Anonymous', '@id': 'http://anomymous.com' }],
        })
      ).toEqual({
        identities: {
          isFetching: false,
          data: [
            {
              '@type': 'Anonymous',
              '@id': 'http://anomymous.com',
            },
          ],
          error: null,
        },
      });
    });
    it('should return an identity error', () => {
      expect(
        authReducer(undefined, {
          type: AuthActionTypes.IDENTITY_FAILED,
          error: new SyntaxError('this is bad'),
        })
      ).toEqual({
        identities: {
          isFetching: false,
          data: [],
          error: new SyntaxError('this is bad'),
        },
      });
    });
    it('should return an identity error and clear previous state data', () => {
      const initState = {
        identities: {
          isFetching: false,
          data: [],
          error: null,
        },
      };
      expect(
        // @ts-ignore
        authReducer(initState, {
          type: AuthActionTypes.IDENTITY_FAILED,
          error: new SyntaxError('this is bad'),
        })
      ).toEqual({
        identities: {
          isFetching: false,
          data: initState.identities.data,
          error: new SyntaxError('this is bad'),
        },
      });
    });
  });
});
