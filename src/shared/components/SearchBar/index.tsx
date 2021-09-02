import * as React from 'react';
import { AutoComplete, Input } from 'antd';

import Hit, { globalSearchOption } from './Hit';
import { focusOnSlash } from '../../utils/keyboardShortcuts';

import './SearchBar.less';

const LABEL_MAX_LENGTH = 25;

const SearchBar: React.FC<{
  projectList: string[];
  query?: string;
  onSearch: (value: string) => void;
  onSubmit: (value: string, option: any) => void;
  onFocus: () => void;
  onClear: () => void;
  onBlur: () => void;
  inputOnPressEnter: () => void;
}> = ({
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

  const handleChange = (value: string) => {
    setValue(value);
  };

  const handleSelect = (value: string, option: any) => {
    onSubmit(value, option);
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

  const generateOptions = () => {
    let options: {
      value: string;
      key: string;
      label: JSX.Element;
    }[] = [];

    if (projectList.length) {
      options = projectList.map((project: string) => {
        const [orgLabel, projectLabel] = project.split('/');

        return {
          key: project,
          label: (
            <Hit orgLabel={orgLabel} projectLabel={projectLabel}>
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
    }
    options = [
      {
        key: 'global-search',
        label: globalSearchOption(value),
        value,
      },
      ...options,
    ];

    return options;
  };

  return (
    <AutoComplete
      className={`search-bar ${!!focused && 'search-bar__focused'}`}
      onFocus={handleSetFocused(true)}
      onBlur={handleSetFocused(false)}
      options={generateOptions()}
      onChange={handleChange}
      onSelect={handleSelect}
      onSearch={handleSearch}
      onKeyDown={handleKeyDown}
      dropdownClassName="search-bar__drop"
      value={value}
      dropdownMatchSelectWidth={false}
      defaultActiveFirstOption
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
