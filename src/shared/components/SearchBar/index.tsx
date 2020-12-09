import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { LoadingOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Input } from 'antd';
import { SearchConfig } from '../../store/reducers/search';
import { AsyncCall } from '../../hooks/useAsynCall';
import { SearchResponse } from '../../types/search';
import ResourceHit from './ResourceHit';
import Hit, { HitType } from './Hit';

import './SearchBar.less';

export enum SearchQuickActions {
  VISIT = 'visit',
}

const SearchBar: React.FC<{
  query?: string;
  searchResponse: AsyncCall<
    SearchResponse<
      Resource<{
        [key: string]: any;
      }>
    >,
    Error
  >;
  searchConfigLoading: boolean;
  searchConfigPreference?: SearchConfig;
  onSearch: (value: string) => void;
  onSubmit: (value: string) => void;
  onClear: () => void;
}> = ({
  query,
  searchResponse,
  searchConfigLoading,
  searchConfigPreference,
  onSearch,
  onSubmit,
  onClear,
}) => {
  const [value, setValue] = React.useState(query || '');
  const [focused, setFocused] = React.useState(false);
  const handleSetFocused = (val: boolean) => () => {
    setFocused(val);
  };
  const inputRef = React.useRef<Input>(null);

  // We can use the convention of / for web search
  // to highlight our search bar
  // in the future it would be beautiful
  // to have a central place to attach keyboard
  // shortcuts
  React.useEffect(() => {
    const focusSearch = (e: KeyboardEvent) => {
      if (e.key === '/' && !focused) {
        inputRef.current && inputRef.current.focus();
        e.preventDefault();
      }
    };
    document.addEventListener('keypress', focusSearch);
    return () => {
      document.removeEventListener('keypress', focusSearch);
    };
  });

  const options = !!query
    ? [
        {
          value,
          key: `search-${value}`,
          label: (
            <Hit type={HitType.UNCERTAIN}>
              <em>{value}</em>
            </Hit>
          ),
        },
        ...(searchResponse.data?.hits.hits.map(hit => {
          const { _source } = hit;
          return {
            key: _source._self,
            label: (
              <Hit type={HitType.RESOURCE}>
                <ResourceHit resource={_source} />
              </Hit>
            ),
            value: `${SearchQuickActions.VISIT}:${_source._self}`,
            source: _source,
          };
        }) || []),
      ]
    : [];

  const handleChange = (value: string) => {
    setValue(value);
  };

  const handleSelect = (value: string) => {
    onSubmit(value);
    if (value.includes(`${SearchQuickActions.VISIT}:`)) {
      setValue('');
      onSearch('');
    }
  };

  const handleSearch = (searchText: string) => {
    onSearch(searchText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !value) {
      return onClear();
    }
    if (e.key === 'Enter') {
      // if no option selected, push the value
      // handleSelect(value);
    }
  };

  console.log({ value, query });

  return (
    <AutoComplete
      className={`search-bar ${!!focused && 'focused'}`}
      onFocus={handleSetFocused(true)}
      onBlur={handleSetFocused(false)}
      defaultValue={value}
      options={options}
      onChange={handleChange}
      onSelect={handleSelect}
      onSearch={handleSearch}
      onKeyDown={handleKeyDown}
      value={value}
    >
      <Input.Search
        ref={inputRef}
        className={'search-bar-input'}
        placeholder="Search or Visit"
        enterButton
        suffix={
          searchConfigLoading ? (
            <LoadingOutlined />
          ) : (
            !!searchConfigPreference && (
              <div>
                <b>{searchConfigPreference.label}</b>
              </div>
            )
          )
        }
      />
    </AutoComplete>
  );
};

export default SearchBar;
