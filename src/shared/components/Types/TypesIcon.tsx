import * as React from 'react';
import { Avatar, Tooltip } from 'antd';
import './Types.less';

// must use require because of incompatable bundling
const Identicon = require('identicon.js');
const md5 = require('md5');

export interface TypesIconProps {
  type: string[];
}

// type represents the field @type
const TypesIcon: React.SFC<TypesIconProps> = ({ type }) => {
  return (
    <ul className="types-list">
      {type.map((type, index) => {
        const typeString = type.toString();
        // must use a hash as Identicon requires a string of atleast 15 chars
        // (making the resulting image effectively a visual hash)
        const typeHash = md5(typeString);
        const iconSizeInPixels = 20;
        const imageData = new Identicon(typeHash, iconSizeInPixels).toString();
        return (
          <li className="types-icon" key={`${typeHash}-${index}`}>
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
