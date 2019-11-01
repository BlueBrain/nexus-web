import * as React from 'react';
import { AutoComplete, Input } from 'antd';
import { SelectValue } from 'antd/lib/select';
import { DataSourceItemType } from 'antd/lib/auto-complete';

import { labelOf, getProp } from '../../utils';
import DropdownItem from './DropdownItem';

import './DropdownFilter.less';

const DropdownFilter: React.FunctionComponent<{
  placeholder?: string;
  defaultSelected?: string;
  dropdownItem?: React.FunctionComponent<{
    count: number;
    key: string;
    label: string;
  }>;
  nothingSelected?: React.FunctionComponent;
  buckets: { count: number; key: string }[];
  onChange(value: string): void;
}> = props => {
  const {
    dropdownItem = DropdownItem,
    defaultSelected,
    buckets,
    placeholder,
    onChange,
  } = props;
  const [inputValue, setInputValue] = React.useState(defaultSelected);

  const handleChange = (value: SelectValue) => {
    onChange(value as string);
  };

  const handleInputChange = (value: SelectValue) => {
    setInputValue(value as string);
  };

  const dataSource = buckets.map(({ key, count }) => {
    const label = labelOf(key);
    return dropdownItem({ key, count, label }) as DataSourceItemType;
  });

  return (
    <div className="dropdown-filter">
      <AutoComplete
        dropdownMatchSelectWidth={false}
        optionLabelProp="title"
        placeholder={placeholder}
        onChange={handleInputChange}
        onSelect={handleChange}
        value={inputValue}
        allowClear={true}
        filterOption={(inputValue, option) => {
          return getProp(option, 'props.value', '')
            .toUpperCase()
            .includes(inputValue.toUpperCase());
        }}
        dataSource={dataSource}
      >
        <Input />
      </AutoComplete>
    </div>
  );
};

export default DropdownFilter;
