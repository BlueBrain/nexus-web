import * as React from 'react';
import { AutoComplete, Input } from 'antd';

import Hit from './Hit';

import './SearchBar.less';

const LABEL_MAX_LENGTH = 25;

const SearchBar: React.FC<{
  projectList: string[];
  query?: string;
  onSearch: (value: string) => void;
  onSubmit: (value: string) => void;
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

  const handleSetFocused = (val: boolean) => () => {
    setFocused(val);

    if (val) {
      onFocus();
    } else {
      onBlur();
    }
  };

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
        inputRef.current && inputRef.current.input.select();
        console.log('inputRef.current', inputRef);

        e.preventDefault();
      }
    };
    document.addEventListener('keypress', focusSearch);
    return () => {
      document.removeEventListener('keypress', focusSearch);
    };
  }, []);

  // Reset default value if query changes
  React.useEffect(() => {
    setValue(query || '');
  }, [query]);

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

  const handleChange = (value: string) => {
    setValue(value);
  };

  const handleSelect = (value: string) => {
    onSubmit(value);
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
      className={`search-bar ${!!focused && 'search-bar__focused'}`}
      onFocus={handleSetFocused(true)}
      onBlur={handleSetFocused(false)}
      options={options}
      onChange={handleChange}
      onSelect={handleSelect}
      onSearch={handleSearch}
      onKeyDown={handleKeyDown}
      dropdownClassName="search-bar__drop"
      value={value}
      dropdownMatchSelectWidth={false}
    >
      <Input
        allowClear
        onPressEnter={inputOnPressEnter}
        ref={inputRef}
        className="search-bar__input"
        placeholder="Visit Project"
        suffix={<div className="search-bar__icon">/</div>}
      />
    </AutoComplete>
  );
};

export default SearchBar;
