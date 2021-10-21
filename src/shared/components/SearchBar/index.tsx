import * as React from 'react';
import { AutoComplete, Input } from 'antd';

import Hit, { globalSearchOption } from './Hit';
import { focusOnSlash } from '../../utils/keyboardShortcuts';

import './SearchBar.less';

const LABEL_MAX_LENGTH = 25;

const SearchBar: React.FC<{
  projectList: string[];
  query?: string;
  lastVisited?: string;
  onSearch: (value: string) => void;
  onSubmit: (value: string, option: any) => void;
  onFocus: () => void;
  onClear: () => void;
  onBlur: () => void;
  inputOnPressEnter: () => void;
}> = ({
  lastVisited,
  query,
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
      label: JSX.Element;
    }[] = [
      {
        value,
        key: 'global-search',
        label: globalSearchOption(value),
      },
    ];

    if (projectList.length) {
      const projectOptions = projectList.map((project: string) => {
        const [orgLabel, projectLabel] = project.split('/');

        return {
          key: project,
          label: (
            <Hit key={project} orgLabel={orgLabel} projectLabel={projectLabel}>
              <span>
                {project.length > LABEL_MAX_LENGTH
                  ? `${project.slice(0, LABEL_MAX_LENGTH)}...`
                  : project}
              </span>
            </Hit>
          ),
          value: `${orgLabel}/${projectLabel}`,
        };
      });
      options = [...options, ...projectOptions];
    }
    return options;
  }, [value, projectList]);

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
    >
      <Input
        allowClear
        onPressEnter={inputOnPressEnter}
        ref={inputRef}
        className="search-bar__input"
        placeholder="Search or jump to..."
        suffix={<div className="search-bar__icon">/</div>}
      />
    </AutoComplete>
  );
};

export default SearchBar;
