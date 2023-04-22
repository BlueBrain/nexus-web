import * as React from 'react';
import { AutoComplete, Tooltip } from 'antd';

import { TypesIcon } from '../Types/TypesIcon';

const Option = AutoComplete.Option;

export const TypeDropdownItem: React.FunctionComponent<{
  count: number;
  key: string;
  label: string;
}> = ({ count, key, label }) => {
  return (
    <Option key={key} value={key} title={label}>
      <Tooltip title={key} placement='topRight'>
        <div className="drop-option">
          <div className="label">
            <span className="count">({count})</span> {label}
          </div>
          {/* <TypesIcon type={label} /> */}
        </div>
      </Tooltip>
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
