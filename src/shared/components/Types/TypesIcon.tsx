import * as React from 'react';
import { Avatar, Tooltip, Tag } from 'antd';
import * as Identicon from 'identicon.js';
import './Types.less';
import * as md5 from 'md5';

export interface TypesIconProps {
  type: string;
}

const MAX_TYPES_TO_DISPLAY = 2;

export const TypesIcon: React.SFC<TypesIconProps> = ({ type }) => {
  const typeString = type.toString();
  // must use a hash as Identicon requires a string of atleast 15 chars
  // (making the resulting image effectively a visual hash)
  const typeHash = md5(typeString);
  const iconSizeInPixels = 20;
  const imageData = new Identicon(typeHash, {
    size: iconSizeInPixels,
    background: [255, 255, 255, 0],
  }).toString();
  const src = `data:image/png;base64,${imageData}`;
  return (
    <div className="types-icon">
      <Tooltip title={typeString}>
        <Tag>
          <Avatar size="small" shape="square" src={src} />
          <span className="label">{typeString}</span>
        </Tag>
      </Tooltip>
    </div>
  );
};

export interface TypesIconListProps {
  type: string[];
  full?: boolean;
}

// type represents the field @type
const TypesIconList: React.SFC<TypesIconListProps> = ({
  type,
  full = false,
}) => {
  // sort types alphabetically for consistency
  // because the graph database isn't aware of order
  // and otherwise they would just be all over the place!
  type.sort((a, b) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });

  let typesToDisplay = type;
  const tooManyTypes = !full && type.length > MAX_TYPES_TO_DISPLAY;
  if (tooManyTypes) {
    typesToDisplay = [...type].slice(0, MAX_TYPES_TO_DISPLAY);
  }

  return (
    <ul className="types-list">
      {typesToDisplay.map((type: string) => (
        <TypesIcon type={type} key={type} />
      ))}
      {tooManyTypes && (
        <li className="ellipsis">
          {`...${type.length - typesToDisplay.length}+`}
        </li>
      )}
    </ul>
  );
};

export default TypesIconList;
