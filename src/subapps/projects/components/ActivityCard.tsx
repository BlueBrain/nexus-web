import * as React from 'react';

import StatusIcon, { Status } from '../components/StatusIcon';

import './ActivityCard.less';

const SubActivityListItem: React.FC = () => {
  return (
    <div>
      <h3>Morphology Release</h3>
      <p>N activities</p>
    </div>
  );
};

const ActivityCard: React.FC<{ name: string }> = ({ name }) => {
  return (
    <div className="activity-card">
      <StatusIcon status={Status.blocked} mini={true} />
      <h3>{name}</h3>
      <p>N code resources</p>
      <p>N data resources</p>
      <p>Free text summary</p>
      <p>N activities</p>

      <div>
        <h3>E-Models</h3>
        <p>N activities</p>
      </div>
      <div>
        <h3>ME-Models</h3>
        <p>N activities</p>
      </div>
    </div>
  );
};

export default ActivityCard;
