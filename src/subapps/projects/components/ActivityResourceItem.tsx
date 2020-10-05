import * as React from 'react';

import './ActivityResourceItem.less';

const ActivityResourceItem: React.FC<{ item: any }> = ({ item }) => {
  return <div className="activity-resource-item">{item.name}</div>;
};

export default ActivityResourceItem;
