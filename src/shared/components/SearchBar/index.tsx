import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { LoadingOutlined } from '@ant-design/icons';
import { AutoComplete, Input } from 'antd';
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
}> = ({
  query,
  searchResponse,
  searchConfigLoading,
  searchConfigPreference,
  onSearch,
  onSubmit,
}) => {
  const [value, setValue] = React.useState(query || '');
  const [focused, setFocused] = React.useState(false);
  const handleSetFocused = (val: boolean) => () => {
    setFocused(val);
  };

  const options = !!query
    ? [
        {
          key: `search-${value}`,
          value,
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
        // {
        //   label: renderTitle('Solutions'),
        //   options: [
        //     renderItem('AntDesign UI FAQ', 60100),
        //     renderItem('AntDesign FAQ', 30010),
        //   ],
        // },
        // {
        //   label: renderTitle('Articles'),
        //   options: [renderItem('AntDesign design language', 100000)],
        // },
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

  return (
    <AutoComplete
      className={`search-bar ${!!focused && 'focused'}`}
      onFocus={handleSetFocused(true)}
      onBlur={handleSetFocused(false)}
      defaultValue={query}
      options={options}
      onChange={handleChange}
      onSelect={handleSelect}
      onSearch={handleSearch}
      value={value}
      // dropdownClassName={`drop-search`}
      // dropdownMatchSelectWidth={600}
    >
      <Input.Search
        className={'search-bar-input'}
        placeholder="Search or Jump to"
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
