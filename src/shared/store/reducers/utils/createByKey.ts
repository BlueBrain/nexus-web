import { AnyAction, Reducer, Action } from 'redux';

// https://medium.com/@mange_vibration/reducer-composition-with-higher-order-reducers-35c3977ed08f
type Predicate = (action: Action) => boolean;
export interface Filter {
  [key: string]: string;
}
export const createByKey = (
  predicate: Predicate,
  mapActionToKey: MapFilterToKey
) => (reducer: Reducer) => {
  return (state: any = {}, action: Action) => {
    if (predicate(action)) {
      const key = mapActionToKey(action);
      return { ...state, [key]: reducer(state[key], action) };
    }
    return state;
  };
};

export interface FilterIndexAction extends Action {
  filterIndex: number;
}

export const createByIndex = (
  predicate: Predicate,
  mapActionToIndex: (action: FilterIndexAction) => number,
  mapStateForReducer: (state: any) => any
) => (reducer: Reducer) => {
  return (state: any[], action: FilterIndexAction) => {
    if (predicate(action)) {
      const index = mapActionToIndex(action);
      if (index >= 0 && index < state.length) {
        const newItem = {
          ...state[index],
          ...reducer(mapStateForReducer(state[index]), action),
        };
        return Object.assign(state.slice(), { [index]: newItem });
      }
      return state;
    }
    return state;
  };
};

type MapFilterToKey = (action: any) => string;
export const createGetByKey = (mapFilterToKey: MapFilterToKey) => {
  return (state: any, filter: Filter) => state[mapFilterToKey(filter)];
};
