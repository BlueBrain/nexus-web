import listsReducer, {
  initialListState,
  DEFAULT_LIST,
  persistanceExporter,
  ListsByProjectState,
} from '../lists';
import {
  ListsByProjectTypes,
  ListByProjectActions,
  ListActionTypes,
  ListActions,
} from '../../actions/lists';

describe('List Reducer', () => {
  it('should return an empty map if by default', () => {
    expect(listsReducer(undefined, { type: 'I_DONT_DO_ANYTHING' })).toEqual({});
  });

  describe('persistanceExporter()', () => {
    it('should return a list of the Map elements', () => {
      const projectUUID = '1234';
      const action: ListByProjectActions = {
        type: ListsByProjectTypes.INITIALIZE_PROJECT_LIST,
        payload: {
          projectUUID,
        },
      };
      const listState = listsReducer(undefined, action);
      expect(persistanceExporter(listState)).toEqual({
        [projectUUID]: initialListState,
      });
    });

    it('should remove the results and replace it with initial values', () => {
      const projectUUID = '1234';
      const listState = {
        [projectUUID]: [
          {
            name: 'Default Query',
            view: 'nxv:defaultElasticSearchIndex',
            query: {
              filters: {},
            },
            request: {
              data: {
                resources: {
                  total: 3,
                  index: 1,
                  results: [],
                },
                paginationSettings: { from: 0, size: 20 },
                '@type': [{ key: 'blah', count: 2 }],
                _constrainedBy: [{ key: 'blah', count: 2 }],
              },
              error: null,
              isFetching: false,
            },
          },
        ],
      };
      expect(persistanceExporter(listState)).toHaveProperty(projectUUID, [
        {
          name: 'Default Query',
          view: 'nxv:defaultElasticSearchIndex',
          query: {
            filters: {},
          },
          request: {
            data: null,
            error: null,
            isFetching: false,
          },
        },
      ]);
    });

    it('should work with an empty state', () => {
      expect(persistanceExporter({})).toEqual({});
    });
  });

  describe(ListsByProjectTypes.INITIALIZE_PROJECT_LIST, () => {
    it('should return a map with the right key and a default query list', () => {
      const projectUUID = '1234';
      const action: ListByProjectActions = {
        type: ListsByProjectTypes.INITIALIZE_PROJECT_LIST,
        payload: {
          projectUUID,
        },
      };
      const state = listsReducer(undefined, action);
      expect(state).toHaveProperty(projectUUID, initialListState);
    });
  });

  describe(ListActionTypes.CREATE, () => {
    it('should create a new list under a specific projectUUID', () => {
      const projectUUID = '1234';
      const action: ListActions = {
        type: ListActionTypes.CREATE,
        filterKey: projectUUID,
      };
      const newList = {
        ...DEFAULT_LIST,
        name: `New Query 2`,
      };
      expect(
        listsReducer(
          {
            [projectUUID]: [DEFAULT_LIST],
          },
          action
        )
      ).toHaveProperty(projectUUID, [DEFAULT_LIST, newList]);
    });
  });
});
