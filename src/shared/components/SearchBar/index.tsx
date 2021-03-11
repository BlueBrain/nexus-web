import * as React from 'react';
import { ProjectResponseCommon, Resource } from '@bbp/nexus-sdk';
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
  VISIT_PROJECT = 'visit-project',
}

const SearchBar: React.FC<{
  projectList: ProjectResponseCommon[];
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
  projectList,
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
  // TODO: in the future it would be beautiful
  // to have a central place to attach keyboard
  // shortcuts
  React.useEffect(() => {
    const focusSearch = (e: KeyboardEvent) => {
      // only focus the search bar if there's no currently focused input element
      // or if there's not a modal
      if (
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLSelectElement ||
        document.querySelectorAll("[class*='modal']").length
      ) {
        return;
      }

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

  // Reset default value if query changes
  React.useEffect(() => {
    setValue(query || '');
  }, [query]);

  const options: (
    | {
        value: string;
        key: string;
        label: JSX.Element;
      }
    | {
        label: string;
        options: {
          value: string;
          key: string;
          label: JSX.Element;
        }[];
      }
  )[] = !!query
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
      ]
    : [];

  if (!!searchResponse.data?.hits.total.value) {
    options.push({
      label: 'Resources',
      options:
        searchResponse.data?.hits.hits.map(hit => {
          const { _source } = hit;
          return {
            key: _source._self,
            label: (
              <Hit type={HitType.RESOURCE}>
                <ResourceHit resource={_source} />
              </Hit>
            ),
            value: `${SearchQuickActions.VISIT}:${_source._self}`,
          };
        }) || [],
    });
  }

  if (projectList.length) {
    options.push({
      label: 'Projects',
      options: projectList.map(project => {
        return {
          // @ts-ignore
          // TODO update nexus-sdk to add this property
          // to types
          key: project._uuid,
          label: (
            <Hit type={HitType.PROJECT}>
              <span>
                {project._organizationLabel}/{project._label}
              </span>
            </Hit>
          ),
          value: `${SearchQuickActions.VISIT_PROJECT}:${project._organizationLabel}/${project._label}`,
        };
      }),
    });
  }

  const handleChange = (value: string) => {
    setValue(value);
  };

  const handleSelect = (value: string) => {
    onSubmit(value);
    if (value.includes(`${SearchQuickActions.VISIT}:`)) {
      setValue('');
    }
  };

  const handleSearch = (searchText: string) => {
    onSearch(searchText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter') {
      return;
    }
    if (!value) {
      return onClear();
    }
  };

  return (
    <AutoComplete
      className={`search-bar ${!!focused && 'focused'}`}
      onFocus={handleSetFocused(true)}
      onBlur={handleSetFocused(false)}
      options={options}
      onChange={handleChange}
      onSelect={handleSelect}
      onSearch={handleSearch}
      onKeyDown={handleKeyDown}
      dropdownClassName="search-drop"
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
