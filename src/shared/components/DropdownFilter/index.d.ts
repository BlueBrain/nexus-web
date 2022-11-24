import * as React from 'react';
import './DropdownFilter.less';
declare const DropdownFilter: React.FunctionComponent<{
  placeholder?: string;
  defaultSelected?: string;
  dropdownItem?: React.FunctionComponent<{
    count: number;
    key: string;
    label: string;
  }>;
  nothingSelected?: React.FunctionComponent;
  buckets: {
    count: number;
    key: string;
  }[];
  onChange(value: string): void;
}>;
export default DropdownFilter;
