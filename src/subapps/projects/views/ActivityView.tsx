import * as React from 'react';
import { useRouteMatch } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { Breadcrumb } from 'antd';

import { useProjectsSubappContext } from '..';
import ProjectPanel from '../components/ProjectPanel';
import ActivitiesBoard from '../components/Activities/ActivitiesBoard';

const ActivityView: React.FC = () => {
  const nexus = useNexusContext();
  const subapp = useProjectsSubappContext();
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    activityId: string;
  }>(`/${subapp.namespace}/:orgLabel/:projectLabel/:activityId`);

  const [activities, setActivities] = React.useState<any[]>([]);
  const [activity, setActivity] = React.useState<any>();

  const projectLabel = match?.params.projectLabel;
  const orgLabel = match?.params.orgLabel;
  // const activityId = match?.params.activityId;
  const activityId = 'ceede3fc-e033-4c1c-8aca-54a9c0132507';

  React.useEffect(() => {
    if (orgLabel && projectLabel) {
      nexus.Resource.get(orgLabel, projectLabel, encodeURIComponent(activityId))
        .then(response => setActivity(response))
        .catch(error => console.error(error));

      nexus.Resource.links(
        orgLabel,
        projectLabel,
        encodeURIComponent(activityId),
        'incoming'
      )
        .then(response =>
          Promise.all(
            response._results.map(link => {
              return nexus.Resource.get(
                orgLabel,
                projectLabel,
                encodeURIComponent(link['@id'])
              );
            })
          ).then(response => {
            setActivities(response);
          })
        )
        .catch(error => console.log('e', error));
    }
  }, []);

  return (
    <div className="activity-view">
      {orgLabel && projectLabel && (
        <ProjectPanel
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          onUpdate={() => {}}
        />
      )}
      {activity && (
        <Breadcrumb separator=">">
          <Breadcrumb.Item>{projectLabel}</Breadcrumb.Item>
          <Breadcrumb.Item href="">Parent Activity</Breadcrumb.Item>
          <Breadcrumb.Item href="">{activity.name}</Breadcrumb.Item>
        </Breadcrumb>
      )}
      <ActivitiesBoard activities={activities} />
    </div>
  );
};

export default ActivityView;
