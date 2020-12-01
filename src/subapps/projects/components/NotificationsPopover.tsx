import * as React from 'react';
import { Button } from 'antd';
import * as moment from 'moment';

import { getUsername } from '../../../shared/utils';

import './NotificationsPopover.less';

const NotififcationsPopover: React.FC<{
  activities: {
    name: string;
    resourceId: string;
    createdAt: string;
    createdBy: string;
  }[];
  onClickLinkActivity: () => void;
  onClickNew: () => void;
}> = ({ activities, onClickLinkActivity, onClickNew }) => {
  return (
    <div className="notifications-popover">
      <p>
        There are activities in your project that are not grouped in any step.
      </p>
      {activities.map(activity => (
        <div
          className="notifications-popover__item"
          key={`activity-${activity.resourceId}`}
        >
          <div className="notifications-popover__main">
            <h4>{activity.name}</h4>
            <p>Created on {moment(activity.createdAt).format('L')}</p>
            <p>Created by {getUsername(activity.createdBy)}</p>
          </div>
          <div className="notifications-popover__actions">
            <Button type="primary" size="small" onClick={onClickLinkActivity}>
              Link
            </Button>
            <Button type="primary" size="small" onClick={onClickNew}>
              New
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotififcationsPopover;
