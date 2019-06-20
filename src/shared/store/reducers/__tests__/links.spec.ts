import { linksReducer } from '../links';
import {
  FetchAction,
  FetchActionWithKey,
  FetchFulfilledActionWithKey,
  FetchFailedActionWithKey,
} from '../../actions/utils';
import { LinksActionTypes } from '../../actions/nexus/links';
import { PaginatedList } from '@bbp/nexus-sdk-legacy';
import { ResourceLink } from '@bbp/nexus-sdk-legacy/lib/Resource/types';

describe('links reducer', () => {
  it('it should return an empty object by default', () => {
    const randomAction = {
      type: 'banana',
    };
    expect(linksReducer(undefined, randomAction)).toEqual({});
  });

  describe('Fetch !', () => {
    it('should return the proper state given incoming key', () => {
      const fetchAction: FetchActionWithKey<LinksActionTypes.FETCHING> = {
        type: LinksActionTypes.FETCHING,
        key: 'incoming',
      };
      expect(linksReducer(undefined, fetchAction)).toEqual({
        incoming: {
          error: null,
          isFetching: true,
          data: null,
        },
      });
    });
    it('should not override an adjacent outgoing key in the state', () => {
      const fetchAction: FetchActionWithKey<LinksActionTypes.FETCHING> = {
        type: LinksActionTypes.FETCHING,
        key: 'incoming',
      };
      expect(
        linksReducer(
          {
            outgoing: {
              error: null,
              isFetching: true,
              data: null,
            },
          },
          fetchAction
        )
      ).toEqual({
        incoming: {
          error: null,
          isFetching: true,
          data: null,
        },
        outgoing: {
          error: null,
          isFetching: true,
          data: null,
        },
      });
    });
    it('should return the proper state given outgoing key', () => {
      const fetchAction: FetchActionWithKey<LinksActionTypes.FETCHING> = {
        type: LinksActionTypes.FETCHING,
        key: 'outgoing',
      };
      expect(linksReducer(undefined, fetchAction)).toEqual({
        outgoing: {
          error: null,
          isFetching: true,
          data: null,
        },
      });
    });
  });

  describe('Fullfilled !', () => {
    it('should return the proper state given incoming key', () => {
      const fetchFulfilledAction: FetchFulfilledActionWithKey<
        LinksActionTypes.FULFILLED,
        PaginatedList<ResourceLink>
      > = {
        type: LinksActionTypes.FULFILLED,
        key: 'incoming',
        payload: {
          index: 0,
          total: 0,
          results: [],
        },
      };
      expect(linksReducer(undefined, fetchFulfilledAction)).toEqual({
        incoming: {
          data: {
            index: 0,
            total: 0,
            results: [],
          },
          isFetching: false,
          error: null,
        },
      });
    });
    it('should not override an adjacent outgoing key in the state', () => {
      const fetchFulfilledAction: FetchFulfilledActionWithKey<
        LinksActionTypes.FULFILLED,
        PaginatedList<ResourceLink>
      > = {
        type: LinksActionTypes.FULFILLED,
        key: 'incoming',
        payload: {
          index: 0,
          total: 0,
          results: [],
        },
      };
      expect(
        linksReducer(
          {
            outgoing: {
              data: {
                index: 0,
                total: 0,
                results: [],
              },
              isFetching: false,
              error: null,
            },
          },
          fetchFulfilledAction
        )
      ).toEqual({
        outgoing: {
          data: {
            index: 0,
            total: 0,
            results: [],
          },
          isFetching: false,
          error: null,
        },
        incoming: {
          data: {
            index: 0,
            total: 0,
            results: [],
          },
          isFetching: false,
          error: null,
        },
      });
    });
    it('should return the proper state given outgoing key', () => {
      const fetchFulfilledAction: FetchFulfilledActionWithKey<
        LinksActionTypes.FULFILLED,
        PaginatedList<ResourceLink>
      > = {
        type: LinksActionTypes.FULFILLED,
        key: 'outgoing',
        payload: {
          index: 0,
          total: 0,
          results: [],
        },
      };
      expect(linksReducer(undefined, fetchFulfilledAction)).toEqual({
        outgoing: {
          data: {
            index: 0,
            total: 0,
            results: [],
          },
          isFetching: false,
          error: null,
        },
      });
    });
  });

  describe('Failed !', () => {
    it('should return the proper state given incoming key', () => {
      const fetchFulfilledAction: FetchFailedActionWithKey<
        LinksActionTypes.FAILED
      > = {
        type: LinksActionTypes.FAILED,
        key: 'incoming',
        error: new Error('banana'),
      };
      expect(linksReducer(undefined, fetchFulfilledAction)).toEqual({
        incoming: {
          data: null,
          isFetching: false,
          error: new Error('banana'),
        },
      });
    });
    it('should not override an adjacent outgoing key in the state', () => {
      const fetchFulfilledAction: FetchFailedActionWithKey<
        LinksActionTypes.FAILED
      > = {
        type: LinksActionTypes.FAILED,
        key: 'incoming',
        error: new Error('banana'),
      };
      expect(
        linksReducer(
          {
            outgoing: {
              data: null,
              isFetching: true,
              error: null,
            },
          },
          fetchFulfilledAction
        )
      ).toEqual({
        outgoing: {
          data: null,
          isFetching: true,
          error: null,
        },
        incoming: {
          data: null,
          isFetching: false,
          error: new Error('banana'),
        },
      });
    });
    it('should return the proper state given outgoing key', () => {
      const fetchFulfilledAction: FetchFailedActionWithKey<
        LinksActionTypes.FAILED
      > = {
        type: LinksActionTypes.FAILED,
        key: 'outgoing',
        error: new Error('banana'),
      };
      expect(linksReducer(undefined, fetchFulfilledAction)).toEqual({
        outgoing: {
          data: null,
          isFetching: false,
          error: new Error('banana'),
        },
      });
    });
  });
});
