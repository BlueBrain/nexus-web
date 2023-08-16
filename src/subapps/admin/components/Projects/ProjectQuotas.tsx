import * as React from 'react';
import { Progress } from 'antd';
import { ProjectStatistics, Quota } from '@bbp/nexus-sdk';

import './ProjectQuotas.scss';

const ProjectQuotas: React.FC<{
  quota: Quota;
  statistics: ProjectStatistics;
}> = ({ quota, statistics }) => {
  const percentOfResources = Math.ceil(
    (statistics.resourcesCount / quota.resources) * 100
  );
  const percentOfEvents = Math.ceil(
    (statistics.eventsCount / quota.events) * 100
  );

  return (
    <div className="project-quotas">
      <h3>Data Volume</h3>
      <div className="project-quotas__dashboards">
        <div className="project-quotas__dashboard">
          <Progress
            strokeLinecap="square"
            type="dashboard"
            percent={percentOfResources}
            status="normal"
          />
          <h4>Total: {statistics.resourcesCount} Resources</h4>
          <h4>Quota: {quota.resources} Resources</h4>
        </div>
        <div className="project-quotas__dashboard">
          <Progress
            strokeLinecap="square"
            type="dashboard"
            percent={percentOfEvents}
            status="normal"
          />
          <h4>Total: {statistics.eventsCount} Events</h4>
          <h4>Quota: {quota.events} Events</h4>
        </div>
      </div>
    </div>
  );
};

export default ProjectQuotas;
