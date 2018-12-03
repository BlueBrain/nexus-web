import * as React from 'react';

import './Resources.less';

export interface ResourceListItemProps {
  name?: string;
  id: string;
  onClick?(): void;
  onEdit?(): void;
}

const ResourceListItem: React.SFC<ResourceListItemProps> = ({
  name,
  id: id,
  onEdit,
  onClick = () => {},
}) => {
  return (
    <li className="ResourceListItem">
      {id} {name}
    </li>
  );
};

export default ResourceListItem;
