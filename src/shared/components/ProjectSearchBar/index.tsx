import * as React from 'react';
import { ProjectResponseCommon } from '@bbp/nexus-sdk';
import { AutoComplete, Input } from 'antd';

import Hit from './Hit';

import './SearchBar.less';

const LABEL_MAX_LENGTH = 25;

const SearchBar: React.FC<{
  projectList: ProjectResponseCommon[];
  query?: string;
  defaultQuery: string | undefined;
  onSearch: (value: string) => void;
  onSubmit: (value: string) => void;
  onClear: () => void;
}> = ({ query, projectList, onSearch, onSubmit, onClear, defaultQuery }) => {
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

  let options: {
    value: string;
    key: string;
    label: JSX.Element;
  }[] = [];

  if (projectList.length) {
    // we display only 5 projects
    options = projectList.splice(0, 5).map(project => {
      const label = `${project._organizationLabel}/${project._label}`;

      return {
        // @ts-ignore
        // TODO update nexus-sdk to add this property
        // to types
        key: project._uuid,
        label: (
          <Hit
            orgLabel={project._organizationLabel}
            projectLabel={project._label}
          >
            <span>
              {label.length > LABEL_MAX_LENGTH
                ? `${label.slice(0, LABEL_MAX_LENGTH)}...`
                : label}
            </span>
          </Hit>
        ),
        value: `${project._organizationLabel}/${project._label}`,
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
        allowClear
        ref={inputRef}
        className="search-bar-input"
        placeholder={defaultQuery || 'Visit Project'}
        enterButton
      />
    </AutoComplete>
  );
};

export default SearchBar;
