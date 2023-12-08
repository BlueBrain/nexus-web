import { AuthActionTypes } from '../../actions/auth';
import authReducer, { AuthState } from '../auth';

describe('Auth Reducer', () => {
  describe('Identities', () => {
    it('should be fetching', () => {
      expect(authReducer(undefined, { type: AuthActionTypes.IDENTITY_FETCHING })).toEqual({
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
          payload: {
            '@context': 'http://context.com/',
            identities: [{ '@type': 'Anonymous', '@id': 'http://anomymous.com' }],
          },
        })
      ).toEqual({
        identities: {
          isFetching: false,
          data: {
            '@context': 'http://context.com/',
            identities: [{ '@type': 'Anonymous', '@id': 'http://anomymous.com' }],
          },
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
      const initState: AuthState = {
        identities: {
          isFetching: false,
          data: {
            '@context': '',
            identities: [],
          },
          error: null,
        },
      };
      expect(
        authReducer(initState, {
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
  });
});
