import { useDispatch } from 'react-redux';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { RootState } from '../store/reducers';

type AppDispatch = ThunkDispatch<RootState, any, AnyAction>;

export function useReduxDispatch(): AppDispatch {
  return useDispatch<AppDispatch>();
}
