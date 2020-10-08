import * as React from 'react';
import { Tooltip } from 'antd';

import TypeTag from './TypeTag';

import './ActivityResourceItem.less';

const ActivityResourceItem: React.FC<{ item: any }> = ({ item }) => {
  const { name, description, externalLink } = item;

  return (
    <div className="activity-resource-item">
      <p className="activity-resource-item__title">
        {externalLink ? (
          <Tooltip placement="topRight" title={externalLink}>
            <a target="_blank" href={externalLink}>
              {name}
            </a>
          </Tooltip>
        ) : (
          name
        )}

        {item.permissions && (
          <span className="activity-resource-item__permission">
            {item.permissions}
          </span>
        )}
      </p>
      <p className="activity-resource-item__description">
        <em>{description}</em>
      </p>
      <p className="activity-resource-item__tag">
        <TypeTag type={item['@type']} />
      </p>
    </div>
  );
};

export default ActivityResourceItem;
