import authReducer from '../auth';
import { AuthActionTypes } from '../../actions/auth';

describe('Auth Reducer', () => {
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
          payload: {
            '@context': 'http://context.com/',
            identities: [
              { '@type': 'Anonymous', '@id': 'http://anomymous.com' },
            ],
          },
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
