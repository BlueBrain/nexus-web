import * as React from 'react';
import { AutoComplete } from 'antd';
import { SelectValue } from 'antd/lib/select';

import { labelOf, getProp } from '../../utils';
import DropdownItem from './DropdownItem';

import './DropdownFilter.scss';

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

  React.useEffect(() => {
    setInputValue(defaultSelected);
  }, [defaultSelected]);

  const handleChange = (value: SelectValue) => {
    onChange(value as string);
  };

  const handleInputChange = (value: SelectValue) => {
    // if value's undefined, we want to trigger
    // a handleChange even so the parent knows
    // to update, if you remove this block
    // the parent won't refresh if the value
    // is cleared using the clear button
    if (value === undefined) {
      handleChange('');
    }
    setInputValue(value as string);
  };

  const dataSource = buckets.map(({ key, count }) => {
    const label = labelOf(key);
    return dropdownItem({ key, count, label });
  });

  return (
    <div className="dropdown-filter">
      <AutoComplete
        dropdownMatchSelectWidth={false}
        placeholder={placeholder}
        onChange={handleInputChange}
        onSelect={handleChange}
        value={inputValue ? inputValue : ''}
        allowClear={true}
        filterOption={(inputValue, option) => {
          return getProp(option, 'props.value', '')
            .toUpperCase()
            .includes(inputValue.toUpperCase());
        }}
      >
        {dataSource}
      </AutoComplete>
    </div>
  );
};

export default DropdownFilter;
