import { AnyAction, Reducer, Action } from 'redux';

// https://medium.com/@mange_vibration/reducer-composition-with-higher-order-reducers-35c3977ed08f
type Predicate = (action: Action) => boolean;
export interface Filter {
  [key: string]: string;
}
const createByKey = (predicate: Predicate, mapActionToKey: MapFilterToKey) => (
  reducer: Reducer
) => {
  return (state: any = {}, action: Action) => {
    if (predicate(action)) {
      const key = mapActionToKey(action);
      return { ...state, [key]: reducer(state[key], action) };
    }
    return state;
  };
};

export default createByKey;

type MapFilterToKey = (action: any) => string;
export const createGetByKey = (mapFilterToKey: MapFilterToKey) => {
  return (state: any, filter: Filter) => state[mapFilterToKey(filter)];
};
