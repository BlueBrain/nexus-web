import * as React from 'react';

import TypeTag from './TypeTag';

import './ActivityResourceItem.less';

const ActivityResourceItem: React.FC<{ item: any }> = ({ item }) => {
  return (
    <div className="activity-resource-item">
      <p className="activity-resource-item__title">
        {item.name}
        {item.permissions && (
          <span className="activity-resource-item__permission">
            {item.permissions}
          </span>
        )}
      </p>
      <p className="activity-resource-item__description">
        <em>{item.description}</em>
      </p>
      <p className="activity-resource-item__tag">
        <TypeTag type={item['@type']} />
      </p>
    </div>
  );
};

export default ActivityResourceItem;
