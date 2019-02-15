import listsReducer, {
  initialListState,
  DEFAULT_LIST,
  persistanceExporter,
  persistanceLoader,
} from '../lists';
import {
  ListsByProjectTypes,
  ListByProjectActions,
  ListActionTypes,
  ListActions,
} from '../../actions/lists';

describe('List Reducer', () => {
  it('should return an empty map if by default', () => {
    expect(
      listsReducer(undefined, { type: 'I_DONT_DO_ANYTHING' }).size
    ).toEqual(0);
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

    it('should work with an empty state', () => {
      expect(persistanceExporter(new Map())).toEqual({});
    });
  });

  describe('persistanceLoader()', () => {
    it('should return a ListsByProjectState state from the local-storage-provided object', () => {
      const projectUUID = '1234';
      const localStorageValue = {
        [projectUUID]: initialListState,
      };
      expect(persistanceLoader(localStorageValue).get(projectUUID)).toEqual(
        initialListState
      );
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
      expect(listsReducer(undefined, action).get(projectUUID)).toEqual(
        initialListState
      );
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
      const someOriginalState = new Map();
      someOriginalState.set(projectUUID, initialListState);
      expect(listsReducer(someOriginalState, action).get(projectUUID)).toEqual([
        DEFAULT_LIST,
        newList,
      ]);
    });
  });
});
