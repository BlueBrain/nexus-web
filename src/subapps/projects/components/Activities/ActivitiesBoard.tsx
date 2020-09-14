import * as React from 'react';

import ActivityCard, { Activity } from './ActivityCard';

import './ActivitiesBoard.less';

const ActivitiesBoard: React.FC<{ activities: Activity[] }> = ({
  activities,
}) => {
  return (
    <div className="activities-board">
      {activities.map(activity => (
        <ActivityCard activity={activity} />
      ))}
    </div>
  );
};

export default ActivitiesBoard;
