import * as React from 'react';
import { Resource } from '@bbp/nexus-sdk';
import { LoadingOutlined } from '@ant-design/icons';
import { AutoComplete, Input } from 'antd';
import { SearchConfig } from '../../store/reducers/search';
import { AsyncCall } from '../../hooks/useAsynCall';
import { SearchResponse } from '../../types/search';
import ResourceHit from './ResourceHit';
import Hit, { HitType } from './Hit';

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
  onSearch: (value: string) => void;
}> = ({
  query,
  searchResponse,
  searchConfigLoading,
  searchConfigPreference,
  onChange,
  onSearch,
}) => {
  const [focused, setFocused] = React.useState(false);

  const handleSetFocused = (val: boolean) => () => {
    setFocused(val);
  };

  const options = !!query
    ? [
        {
          value: 'search',
          label: (
            <Hit type={HitType.UNCERTAIN}>
              <em>{query}</em>
            </Hit>
          ),
        },
        ...(searchResponse.data?.hits.hits.map(hit => {
          const { _source } = hit;
          return {
            label: (
              <Hit type={HitType.RESOURCE}>
                <ResourceHit resource={_source} />
              </Hit>
            ),
            value: _source['@id'],
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

  console.log({ searchResponse });

  return (
    <AutoComplete
      onFocus={handleSetFocused(true)}
      onBlur={handleSetFocused(false)}
      options={options}
      onChange={onChange}
      onSearch={onSearch}
    >
      <Input.Search
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
        style={{ minWidth: focused ? '600px' : '400px' }}
      />
    </AutoComplete>
  );
};

export default SearchBar;
