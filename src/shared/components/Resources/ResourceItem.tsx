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
  name,
  constrainedBy,
  type,
  id: id,
  onEdit,
  onClick = () => {},
}) => {
  return (
    <Item className="resource-item">
      <Item.Meta
        title={`${id} ${name}`}
        description={
          <div>
            {type && <TypesIcon type={type} />}
            <span>{constrainedBy}</span>
          </div>
        }
      />
    </Item>
  );
};

export default ResourceListItem;
