import * as React from 'react';

import ActivityCard, { Activity } from './ActivityCard';

import './ActivitiesBoard.less';

const ActivitiesBoard: React.FC<{
  activities: Activity[];
  projectLabel: string;
  orgLabel: string;
}> = ({ activities, projectLabel, orgLabel }) => {
  return (
    <div className="activities-board">
      {activities.map(activity => (
        <ActivityCard
          activity={activity}
          key={activity['@id']}
          projectLabel={projectLabel}
          orgLabel={orgLabel}
        />
      ))}
    </div>
  );
};

export default ActivitiesBoard;
