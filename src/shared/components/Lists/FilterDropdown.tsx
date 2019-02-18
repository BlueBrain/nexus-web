import * as React from 'react';
import { AutoComplete, Input, Icon } from 'antd';
import './FilterDropdown.less';
import SchemaTypeOption from '../Resources/SchemaOption';

const Option = AutoComplete.Option;

const getLabelFromFilterKey = (filterKey: string) => {
  return filterKey === '_constrainedBy' ? 'schema' : filterKey;
};

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
        const label = getLabelFromFilterKey(filterKey);
        return (
          <React.Fragment key={filterKey}>
            <label>{label}</label>
            <AutoComplete
              key={filterKey}
              className="certain-category-search"
              dropdownClassName="certain-category-search-dropdown"
              dropdownMatchSelectWidth={false}
              value={value}
              dataSource={filterValues[filterKey].map(({ key, count }) => (
                <Option key={key}>
                  <SchemaTypeOption value={key} count={count} />
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
              placeholder={`Filter by ${label}`}
              optionLabelProp="value"
            >
              <Input
                allowClear={!!value}
                suffix={
                  <Icon type="filter" className="certain-category-icon" />
                }
              />
            </AutoComplete>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default FilterDropdown;
