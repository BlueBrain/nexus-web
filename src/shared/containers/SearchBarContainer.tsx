import { AutoComplete, Input } from 'antd';
import * as React from 'react';
import { useSelector } from 'react-redux';
import useSearchConfigs from '../hooks/useSearchConfigs';
import { RootState } from '../store/reducers';

const SearchBarContainer: React.FC = () => {
  const [focused, setFocused] = React.useState(false);
  const searchConfigs = useSearchConfigs();
  //   const searchPreference = useSelector(
  //     (state: RootState) => state.search.searchPreference
  //   );

  console.log({ searchConfigs });

  const searchPreference = useSelector(
    (state: RootState) => state.search.searchPreference
  );

  const handleSetFocused = (val: boolean) => () => {
    setFocused(val);
  };

  return (
    <AutoComplete
      onFocus={handleSetFocused(true)}
      onBlur={handleSetFocused(false)}
    >
      <Input.Search
        placeholder="Search"
        enterButton
        // style={{ width: focused ? '600px' : '400px' }}
      />
    </AutoComplete>
  );
};

export default SearchBarContainer;
