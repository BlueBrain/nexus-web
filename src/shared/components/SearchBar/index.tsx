import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { LoadingOutlined } from '@ant-design/icons';
import { AutoComplete, Input } from 'antd';
import { SearchConfig } from '../../store/reducers/search';
import { AsyncCall } from '../../hooks/useAsynCall';
import { SearchResponse } from '../../types/search';
import ResourceHit from './ResourceHit';
import Hit, { HitType } from './Hit';
import { OptionType } from 'antd/lib/select';

import './SearchBar.less';

export enum SearchQuickActions {
  VISIT = 'visit',
}

// TODO
// First option is to search for wahtever in search page
// next options is different
// directly navigate to resource in project
// change preferred search config

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
  onChange:
    | ((
        value: string
      ) => // option: OptionsType | OptionData | OptionGroupData
      void)
    | undefined;
  onSubmit: (value: string, option?: object) => void;
}> = ({
  query,
  searchResponse,
  searchConfigLoading,
  searchConfigPreference,
  onChange,
  onSubmit,
}) => {
  const [focused, setFocused] = React.useState(false);

  const handleSetFocused = (val: boolean) => () => {
    setFocused(val);
  };

  const options = !!query
    ? [
        {
          key: 'search',
          value: query,
          label: (
            <Hit type={HitType.UNCERTAIN}>
              <em>{query}</em>
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

  return (
    <AutoComplete
      onFocus={handleSetFocused(true)}
      onBlur={handleSetFocused(false)}
      options={options}
      onChange={onChange}
      onSelect={onSubmit}
      className={`search-bar ${!!focused && 'focused'}`}
      dropdownClassName={`drop-search`}
      dropdownMatchSelectWidth={600}
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
