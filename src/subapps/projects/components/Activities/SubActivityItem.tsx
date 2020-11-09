import * as React from 'react';
import { Link } from 'react-router-dom';
import { Tooltip } from 'antd';

import StatusIcon, { Status } from '../StatusIcon';

import './SubActivityItem.less';

const SubActivityItem: React.FC<{
  activityId: string;
  orgLabel: string;
  projectLabel: string;
  title: string;
  status: Status;
}> = ({ title, status, activityId, orgLabel, projectLabel }) => {
  return (
    <div className="sub-activity">
      <StatusIcon status={status} mini={true} />
      <div className="sub-activity__content">
        <Link to={`/projects/${orgLabel}/${projectLabel}/${activityId}`}>
          {title.length > 25 ? (
            <Tooltip placement="topRight" title={title}>
              <h3 className="sub-activity__title">
                {`${title.slice(0, 25)}...`}
              </h3>
            </Tooltip>
          ) : (
            <h3 className="sub-activity__title">{title}</h3>
          )}
        </Link>
      </div>
    </div>
  );
};

export default SubActivityItem;
