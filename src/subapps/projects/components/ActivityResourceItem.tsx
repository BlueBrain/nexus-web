import * as React from 'react';

import TypeTag from './TypeTag';

import './ActivityResourceItem.less';

const ActivityResourceItem: React.FC<{ item: any; link: string }> = ({
  item,
  link,
}) => {
  const { name, description } = item;

  return (
    <div className="activity-resource-item">
      <p className="activity-resource-item__title">
        {/* TODO: Create Projects Specific Resource View */}
        <a href={link}>{name}</a>

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
