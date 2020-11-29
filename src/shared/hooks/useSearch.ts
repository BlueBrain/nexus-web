import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSearchConfigs } from '../store/actions/search';
import { RootState } from '../store/reducers';
import { useReduxDispatch } from './useReduxDispatch';

export default () => {
  const { searchConfigs } = useSelector((state: RootState) => state.search);
  const dispatch = useReduxDispatch();
  React.useEffect(() => {
    dispatch(fetchSearchConfigs());
  }, []);

  return {
    searchConfigs,
  };
};
