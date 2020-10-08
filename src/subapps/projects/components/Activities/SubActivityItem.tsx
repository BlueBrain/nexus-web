import * as React from 'react';
import { Tooltip } from 'antd';

import StatusIcon, { Status } from '../StatusIcon';

import './SubActivityItem.less';

const SubActivityItem: React.FC<{
  title: string;
  activitiesNumber?: number;
  status: Status;
}> = ({ title, activitiesNumber, status }) => {
  return (
    <div className="sub-activity">
      <StatusIcon status={status} mini={true} />
      <div className="sub-activity__content">
        {title.length > 25 ? (
          <Tooltip placement="topRight" title={title}>
            <h3 className="sub-activity__title">
              {title.slice(0, 25) + '...'}
            </h3>
          </Tooltip>
        ) : (
          <h3 className="sub-activity__title">{title}</h3>
        )}
      </div>
    </div>
  );
};

export default SubActivityItem;
