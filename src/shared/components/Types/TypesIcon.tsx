import './Types.scss';

import { Tag, Tooltip } from 'antd';
import * as React from 'react';

import { labelOf } from '../../utils';

export interface TypesIconProps {
  type: string;
}

const MAX_TYPES_TO_DISPLAY = 2;

export const TypesIcon: React.SFC<TypesIconProps> = ({ type }) => {
  const typeString = type.toString();
  const typeLabel = labelOf(typeString);
  return (
    <div className="types-icon">
      <Tooltip title={typeString}>
        <Tag color="blue">{typeLabel}</Tag>
      </Tooltip>
    </div>
  );
};

export interface TypesIconListProps {
  type: string[];
  full?: boolean;
}

// type represents the field @type
const TypesIconList: React.SFC<TypesIconListProps> = ({ type, full = false }) => {
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
    <ul className={`types-list ${full ? '-full' : ''}`}>
      {typesToDisplay.map((type: string) => (
        <TypesIcon type={type} key={type} />
      ))}
      {tooManyTypes && <li className="ellipsis">{`...${type.length - typesToDisplay.length}+`}</li>}
    </ul>
  );
};

export default TypesIconList;
