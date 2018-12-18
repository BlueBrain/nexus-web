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
    <div className="clickable-container" onClick={onClick}>
      <Item className="resource-item">
        <Item.Meta
          title={name}
          description={
            <div>
              {type && type.length && <TypesIcon type={type} />}
              <span>{constrainedBy}</span>
            </div>
          }
        />
      </Item>
    </div>
  );
};

export default ResourceListItem;
