import * as React from 'react';
import { Avatar, Tooltip } from 'antd';

import './Types.less';

export interface TypesIconProps {
  type: URL[];
}

const color = '#f56a00';

// type represents the field @type
const TypesIcon: React.SFC<TypesIconProps> = ({ type }) => {
  return (
    <div className="TypesIcon">
      <ul>
        {type.map(type => {
          return (
            <li>
              <Tooltip title={type.toString()}>
                <Avatar
                  style={{ backgroundColor: color, verticalAlign: 'middle' }}
                  size="large"
                >
                  {'Hello!'}
                </Avatar>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TypesIcon;
