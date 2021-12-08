import * as React from 'react';
import { AutoComplete, Input } from 'antd';

import Hit, { globalSearchOption } from './Hit';
import { focusOnSlash } from '../../utils/keyboardShortcuts';

import './SearchBar.less';
import {
  ProjectSearchHit,
  StudioSearchHit,
} from '../../containers/SearchBarContainer';
import { makeProjectUri, makeStudioUri } from '../../utils';

const LABEL_MAX_LENGTH = 25;

const SearchBar: React.FC<{
  projectList: ProjectSearchHit[];
  studioList: StudioSearchHit[];
  query?: string;
  onSearch: (value: string) => void;
  onSubmit: (value: string, option: any) => void;
  onFocus: () => void;
  onClear: () => void;
  onBlur: () => void;
  inputOnPressEnter: () => void;
}> = ({
  query,
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

  const handleChange = (currentValue: string) => {
    setValue(currentValue);
  };

  const handleSelect = (currentValue: string, option: any) => {
    setValue(currentValue);
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
    if (!value) {
      return onClear();
    }
  };

  const optionsList = React.useMemo(() => {
    let options: {
      value: string;
      key: string;
      path: string;
      type: 'search' | 'project' | 'studio';
      label: JSX.Element;
    }[] = [
      {
        value,
        key: 'search',
        path: `/search/?query=${value}`,
        type: 'search',
        label: globalSearchOption(value),
      },
    ];

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
          value: `${projectHit.organisation}/${projectHit.project}`,
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
          value: `${studioHit.project}/${studioHit.label}`,
        };
      });
      options = [...options, ...studioOptions];
    }
    return options;
  }, [value, projectList, studioList]);

  return (
    <AutoComplete
      backfill
      defaultActiveFirstOption
      className="search-bar"
      onFocus={handleSetFocused(true)}
      onBlur={handleSetFocused(false)}
      options={optionsList}
      onChange={handleChange}
      onSelect={handleSelect}
      onSearch={handleSearch}
      onKeyDown={handleKeyDown}
      dropdownClassName="search-bar__drop"
      dropdownMatchSelectWidth={false}
      value={value}
      listHeight={310}
    >
      <Input
        allowClear
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
