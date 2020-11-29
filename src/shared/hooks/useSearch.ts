import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSearchConfigs } from '../store/actions/search';
import { RootState } from '../store/reducers';

export default () => {
  const { searchConfigs } = useSelector((state: RootState) => state.search);
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(fetchSearchConfigs);
  }, []);

  console.log({ searchConfigs });
  return {
    searchConfigs,
  };
};
