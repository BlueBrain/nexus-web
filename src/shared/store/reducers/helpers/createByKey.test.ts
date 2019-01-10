import createByKey, { createGetByKey, Filter } from './createByKey';
import { Action, AnyAction } from 'redux';

describe('createByKey()', () => {
  it('should create a simple byKey-reducer', () => {
    const reducer = (state = null, action: AnyAction) => {
      return action.type === 'FETCH_SUCCESS' ? action.payload : state;
    };

    const byKeyReducer = createByKey(
      action => action.hasOwnProperty('filterKey'),
      (action: { filterKey: string }) => action.filterKey
    )(reducer);
    const getByKey = createGetByKey(({ filterKey }: Filter) => filterKey);

    const state = [
      {},
      {
        type: 'FETCH_SUCCESS',
        filterKey: 'bob',
        payload: 'some-payload',
      },
    ].reduce(byKeyReducer, undefined);

    expect(getByKey(state, { filterKey: 'bob' })).toBe('some-payload');
  });
});
