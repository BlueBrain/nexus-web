import * as React from 'react';
import { AutoComplete } from 'antd';

import { TypesIcon } from '../Types/TypesIcon';

const Option = AutoComplete.Option;

export const TypeDropdownItem: React.FunctionComponent<{
  count: number;
  key: string;
  label: string;
}> = ({ count, key, label }) => {
  console.log({ count, key, label });

  return (
    <Option key={key} value={key} title={label}>
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
    <Option key={key} value={key} title={label}>
      <div className="drop-option">
        <div className="label">
          <span className="count">({count})</span> {label}
        </div>
      </div>
    </Option>
  );
};

export default DropdownItem;
