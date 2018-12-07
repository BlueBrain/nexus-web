import * as React from 'react';
import { Avatar, Tooltip } from 'antd';
import * as Identicon from 'identicon.js';
import './Types.less';

export interface TypesIconProps {
  type: string[];
}

// type represents the field @type
const TypesIcon: React.SFC<TypesIconProps> = ({ type }) => {
  return (
    <ul className="types-list">
      {type.map(type => {
        const typeString = type.toString();
        const imageData: string = new Identicon(typeString, 420).toString();
        return (
          <li className="types-icon">
            <Tooltip title={typeString}>
              <Avatar
                shape="square"
                size="small"
                src={`data:image/png;base64,${imageData}`}
              />
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
};

export default TypesIcon;
