import * as React from 'react';
import { AutoComplete, Input } from 'antd';

import Hit, { globalSearchOption } from './Hit';
import { focusOnSlash } from '../../utils/keyboardShortcuts';

import './SearchBar.less';
import {
  LastVisited,
  ProjectSearchHit,
  StudioSearchHit,
} from '../../containers/SearchBarContainer';
import { makeProjectUri, makeStudioUri } from '../../utils';

const LABEL_MAX_LENGTH = 25;

const SearchBar: React.FC<{
  projectList: ProjectSearchHit[];
  studioList: StudioSearchHit[];
  query?: string;
  lastVisited?: LastVisited;
  onSearch: (value: string) => void;
  onSubmit: (value: string, option: any) => void;
  onFocus: () => void;
  onClear: () => void;
  onBlur: () => void;
  inputOnPressEnter: () => void;
}> = ({
  query,
  lastVisited,
  studioList,
  projectList,
  onSearch,
  onSubmit,
  onClear,
  onFocus,
  onBlur,
  inputOnPressEnter,
}) => {
  const [value, setValue] = React.useState(query || '');
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef<Input>(null);
  const projectOptionValueSuffix = '______project';
  const studioOptionValueSuffix = '______studio';

  React.useEffect(() => {
    focusOnSlash(focused, inputRef);
  }, []);

  // Reset default value if query changes
  React.useEffect(() => {
    setValue(query || '');
  }, [query]);

  const handleSetFocused = (value: boolean) => () => {
    setFocused(value);
    if (value) {
      onFocus();
    } else {
      onBlur();
    }
  };

  const handleSelect = (currentValue: string, option: any) => {
    onSubmit(currentValue, option);
    inputRef.current?.blur();
  };

  const handleSearch = (searchText: string) => {
    onSearch(searchText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter') {
      return;
    }
  };

  const optionsList = React.useMemo(() => {
    let options: {
      value: string;
      key: string;
      path: string;
      type: 'search' | 'project' | 'studio';
      label: JSX.Element;
    }[] = [];
    if (
      (!query || query === '') &&
      lastVisited &&
      lastVisited.type === 'search'
    ) {
      options.push({
        value: lastVisited.value,
        key: 'search',
        path: lastVisited.path,
        type: 'search',
        label: globalSearchOption(lastVisited.value),
      });
    } else {
      options.push({
        value,
        key: 'search',
        path: `/search/?query=${value}`,
        type: 'search',
        label: globalSearchOption(value),
      });
    }

    if (projectList.length) {
      const projectOptions = projectList.map((projectHit, ix) => {
        return {
          key: `project-${projectHit.label}${ix}`,
          path: makeProjectUri(projectHit.organisation, projectHit.project),
          type: 'project' as 'project',
          label: (
            <Hit
              key={projectHit.label}
              orgLabel={projectHit.organisation}
              projectLabel={projectHit.project}
              type="project"
            >
              <span>
                {projectHit.label.length > LABEL_MAX_LENGTH
                  ? `${projectHit.label.slice(0, LABEL_MAX_LENGTH)}...`
                  : projectHit.label}
              </span>
            </Hit>
          ),
          // add suffix to value to differentiate from search term
          value: `${projectHit.organisation}/${projectHit.project}${projectOptionValueSuffix}`,
        };
      });
      options = [...options, ...projectOptions];
    }

    if (studioList.length) {
      const studioOptions = studioList.map((studioHit, ix) => {
        return {
          key: `studio-${studioHit.label}${ix}`,
          path: makeStudioUri(
            studioHit.organisation,
            studioHit.project,
            studioHit.studioId
          ),
          type: 'studio' as 'studio',
          label: (
            <Hit
              key={studioHit.label}
              orgLabel={studioHit.organisation}
              projectLabel={studioHit.project}
              type="studio"
            >
              <span>
                {studioHit.label.length > LABEL_MAX_LENGTH
                  ? `${studioHit.label.slice(0, LABEL_MAX_LENGTH)}...`
                  : studioHit.label}
              </span>
            </Hit>
          ),
          // add suffix to value to differentiate from search term
          value: `${studioHit.project}/${studioHit.label}${studioOptionValueSuffix}`,
        };
      });
      options = [...options, ...studioOptions];
    }
    return options;
  }, [value, projectList, studioList]);

  return (
    <AutoComplete
      backfill={false}
      defaultActiveFirstOption
      className="search-bar"
      onFocus={handleSetFocused(true)}
      onBlur={handleSetFocused(false)}
      options={optionsList}
      onSelect={handleSelect}
      onSearch={handleSearch}
      onKeyDown={handleKeyDown}
      dropdownClassName="search-bar__drop"
      dropdownMatchSelectWidth={false}
      /**
       * Autocomplete uses option value rather than key to differentiate so if there are multiple
       * options with the same value it's as if the last one was selected always which results in
       * us not being able to search when the search term matches a project or studio value. We add
       * a suffix to project and studio values to prevent this and remove it here for display. Bit
       * hacky!
       *
       * See Antd autocomplete bug here https://github.com/ant-design/ant-design/issues/11909
       */
      value={value
        .replace(projectOptionValueSuffix, '')
        .replace(studioOptionValueSuffix, '')}
      listHeight={310}
    >
      <Input
        allowClear
        onKeyDown={handleKeyDown}
        onChange={e => {
          // clicked clear button or removed the search text.
          if (e.type === 'click' || e.target.value === '') {
            onClear();
          }
        }}
        onPressEnter={inputOnPressEnter}
        ref={inputRef}
        className={`search-bar__input ${focused ? 'focused' : ''}`}
        placeholder="Search or jump to..."
        suffix={<div className="search-bar__icon">/</div>}
      />
    </AutoComplete>
  );
};

export default SearchBar;
