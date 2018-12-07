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
  const validTypes: string[] = type ? type.filter(t => t.length >= 15) : [];
  return (
    <Item className="resource-item">
      <Item.Meta
        title={`${id} ${name}`}
        description={
          <div>
            {validTypes.length > 0 && <TypesIcon type={validTypes} />}
            <span>{constrainedBy}</span>
          </div>
        }
      />
    </Item>
  );
};

export default ResourceListItem;
