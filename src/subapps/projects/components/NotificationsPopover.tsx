import './NotificationsPopover.scss';

import { Button, Tooltip } from 'antd';
import moment from 'moment';
import * as React from 'react';

import TypesIconList from '../../../shared/components/Types/TypesIcon';
import { getDateString, getUsername, labelOf } from '../../../shared/utils';

const NotififcationsPopover: React.FC<{
  activities: {
    name?: string;
    resourceId: string;
    createdAt: string;
    createdBy: string;
    usedList?: string[];
    generatedList?: string[];
    resourceType?: string | string[];
  }[];
  onClickLinkActivity: (id: string) => void;
  onClickNew: (id: string) => void;
}> = ({ activities, onClickLinkActivity, onClickNew }) => {
  return (
    <div className="notifications-popover">
      <p>
        {activities && activities.length > 0
          ? 'There are activities in your project that are not grouped in any step.'
          : 'No detached activities'}
      </p>
      {activities.map((activity) => (
        <div className="notifications-popover__item" key={`activity-${activity.resourceId}`}>
          <div className="notifications-popover__main">
            <h4>{activity.name || labelOf(activity.resourceId)}</h4>
            <p className="notifications-popover__types">
              {activity.resourceType && Array.from(activity.resourceType).length > 0 && (
                <TypesIconList
                  type={Array.from(activity.resourceType).map((type) => labelOf(type))}
                />
              )}
            </p>
            <p>
              Created on {getDateString(moment(activity.createdAt), { noTime: true })} by{' '}
              {getUsername(activity.createdBy)}
            </p>
            {/* TODO: fetch an agent */}
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
            <Tooltip title="Create new Workflow Step with this Activity">
              <Button type="primary" size="small" onClick={() => onClickNew(activity.resourceId)}>
                New
              </Button>
            </Tooltip>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotififcationsPopover;
