import { search } from '!!raw-loader!*';
import * as React from 'react';
import { useSelector } from 'react-redux';
import {
  fetchSearchConfigs,
  setSearchPreferenceToLocalStore,
} from '../store/actions/search';
import { RootState } from '../store/reducers';
import { useReduxDispatch } from './useReduxDispatch';

/*
 * This controls behavior of setting and fetching search
 * configurations and preferences for the user
 */

export default function useSearchConfigs() {
  const {
    searchConfigs,
    searchPreference: preferedSearchConfigID,
  } = useSelector((state: RootState) => state.search);
  const dispatch = useReduxDispatch();

  // Fetch configs on bootup
  React.useEffect(() => {
    dispatch(fetchSearchConfigs());
  }, []);

  // Set search preference default if not already set
  React.useEffect(() => {
    if (
      !preferedSearchConfigID &&
      searchConfigs.data &&
      searchConfigs.data.length > 0
    ) {
      setSearchPreference(searchConfigs.data[0].id);
    }
  }, [preferedSearchConfigID, searchConfigs.data]);

  const setSearchPreference = (preference: string) => {
    dispatch(setSearchPreferenceToLocalStore(preference));
  };

  const preferedSearchConfig = searchConfigs.data?.find(
    searchConfig => searchConfig.id === preferedSearchConfigID
  );

  return {
    searchConfigs,
    preferedSearchConfigID,
    preferedSearchConfig,
    setSearchPreference,
  };
}
