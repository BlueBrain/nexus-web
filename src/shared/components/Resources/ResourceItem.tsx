import * as React from 'react';
import { List } from 'antd';
import TypesIcon from '../Types/TypesIcon';

import './Resources.less';

const { Item } = List;

export interface ResourceItemProps {
  name?: string;
  id: string;
  type?: string[];
  constrainedBy: string;
  onClick?(): void;
  onEdit?(): void;
}

const ResourceListItem: React.FunctionComponent<ResourceItemProps> = ({
  constrainedBy,
  type,
  name,
  onClick = () => {},
}) => {
  return (
    <div className="clickable-container resource-item" onClick={onClick}>
      <div className="name">
        <em>{name}</em>
      </div>
      {/* <div className="schema">{constrainedBy}</div> */}
      {type && type.length && <TypesIcon type={type} />}
    </div>
  );
};

export default ResourceListItem;
