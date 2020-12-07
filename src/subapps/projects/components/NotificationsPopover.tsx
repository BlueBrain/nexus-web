import * as React from 'react';
import { Button, Tooltip } from 'antd';
import * as moment from 'moment';

import { getUsername, labelOf } from '../../../shared/utils';

import './NotificationsPopover.less';

const NotififcationsPopover: React.FC<{
  activities: {
    name?: string;
    resourceId: string;
    createdAt: string;
    createdBy: string;
    usedList?: string[];
    generatedList?: string[];
    resourceType?: string;
  }[];
  onClickLinkActivity: (id: string) => void;
  onClickNew: () => void;
}> = ({ activities, onClickLinkActivity, onClickNew }) => {
  console.log('activities', activities);

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
            <h4>{activity.name || labelOf(activity.resourceId)}</h4>
            <p>Created on {moment(activity.createdAt).format('L')}</p>
            {/* TODO: fetch an agent */}
            <p>Created by {getUsername(activity.createdBy)}</p>
          </div>
          <div className="notifications-popover__actions">
            <Tooltip title="Link this activity to an existing Workflow Step">
              <Button
                type="primary"
                size="small"
                onClick={() => onClickLinkActivity(activity.resourceId)}
              >
                Link
              </Button>
            </Tooltip>

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
