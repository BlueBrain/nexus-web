import * as React from 'react';
import { AutoComplete, Input, Icon, Menu } from 'antd';
import './FilterDropdown.less';

const FilterDropdown: React.FunctionComponent<any> = ({}) => {
  return (
    <div className="filter-dropdown">
      <AutoComplete
        className="certain-category-search"
        dropdownClassName="certain-category-search-dropdown"
        dropdownMatchSelectWidth={false}
        onSelect={(value, option) => {}}
        style={{ width: '100%', marginBottom: '1em' }}
        placeholder={`Filter by Schema`}
        optionLabelProp="value"
      >
        <Input
          suffix={<Icon type="filter" className="certain-category-icon" />}
        />
      </AutoComplete>
      <AutoComplete
        className="certain-category-search"
        dropdownClassName="certain-category-search-dropdown"
        dropdownMatchSelectWidth={false}
        onSelect={(value, option) => {}}
        style={{ width: '100%', marginBottom: '1em' }}
        placeholder={`Filter by @type`}
        optionLabelProp="value"
      >
        <Input
          suffix={<Icon type="filter" className="certain-category-icon" />}
        />
      </AutoComplete>
    </div>
  );
};

export default FilterDropdown;
