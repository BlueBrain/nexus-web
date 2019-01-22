import * as React from 'react';
import { AutoComplete, Input, Icon, Menu } from 'antd';
import './FilterDropdown.less';

const Option = AutoComplete.Option;

interface FilterDropdownProps {
  query: any;
  filterValues: { [key: string]: { key: string; count: number }[] };
  onFilterChange: (value: { [key: string]: string | null }) => void;
}

const FilterDropdown: React.FunctionComponent<FilterDropdownProps> = ({
  query,
  onFilterChange,
  filterValues,
}) => {
  return (
    <div className="filter-dropdown">
      {Object.keys(filterValues).map(filterKey => {
        const value = query.filters && query.filters[filterKey];
        return (
          <>
            <label>{filterKey}</label>
            <AutoComplete
              key={filterKey}
              className="certain-category-search"
              dropdownClassName="certain-category-search-dropdown"
              dropdownMatchSelectWidth={false}
              value={value}
              dataSource={filterValues[filterKey].map(({ key, count }) => (
                <Option key={key}>
                  <div className="schema-value">
                    <span>{key}</span>
                    <span>{count}</span>
                  </div>
                </Option>
              ))}
              onChange={value => {
                if (!value) {
                  onFilterChange({ [filterKey]: null });
                }
              }}
              onSelect={(value, option) => {
                onFilterChange({ [filterKey]: value as string | null });
              }}
              style={{ width: '100%', marginBottom: '1em' }}
              placeholder={`Filter by ${filterKey}`}
              optionLabelProp="value"
            >
              <Input
                allowClear={!!value}
                suffix={
                  <Icon type="filter" className="certain-category-icon" />
                }
              />
            </AutoComplete>
          </>
        );
      })}
    </div>
  );
};

export default FilterDropdown;
