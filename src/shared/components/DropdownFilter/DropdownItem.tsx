import * as React from 'react';
import { AutoComplete } from 'antd';

import { TypesIcon } from '../Types/TypesIcon';

const Option = AutoComplete.Option;

export const TypeDropdownItem: React.FunctionComponent<{
  count: number;
  key: string;
  label: string;
}> = ({ count, key, label }) => {
  return (
    // Option does in fact have a label property, the ts warning is a lie.
    // @ts-ignore (overloaded Options props with label, it works!)
    <Option key={key} value={key} label={label}>
      <div className="drop-option">
        <div className="label">
          <span className="count">({count})</span> {label}
        </div>
        <TypesIcon type={label} />
      </div>
    </Option>
  );
};

export const DropdownItem: React.FunctionComponent<{
  count: number;
  key: string;
  label: string;
}> = ({ count, key, label }) => {
  return (
    // Option does in fact have a label property, the ts warning is a lie.
    // @ts-ignore (overloaded Options props with label, it works!)
    <Option key={key} value={key} label={label}>
      <div className="drop-option">
        <div className="label">
          <span className="count">({count})</span> {label}
        </div>
      </div>
    </Option>
  );
};

export default DropdownItem;
