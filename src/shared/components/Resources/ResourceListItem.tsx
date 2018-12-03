import * as React from 'react';
import { List } from 'antd';
import SchemaIcon from './SchemaIcon';

import './Resources.less';

const { Item } = List;

export interface ResourceListItemProps {
  name?: string;
  id: string;
  // should be more obvious this is a schema?
  _constrainedBy: string;
  onClick?(): void;
  onEdit?(): void;
}

const ResourceListItem: React.SFC<ResourceListItemProps> = ({
  name,
  _constrainedBy,
  id: id,
  onEdit,
  onClick = () => {},
}) => {
  return (
    <Item className="ResourceListItem">
      <Item.Meta
        avatar={<SchemaIcon id={_constrainedBy} />}
        title={`${id} ${name}`}
        description={_constrainedBy}
      />
    </Item>
  );
};

export default ResourceListItem;
