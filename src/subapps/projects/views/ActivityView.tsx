import * as React from 'react';
import { useRouteMatch } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { Breadcrumb } from 'antd';

import { useProjectsSubappContext } from '..';
import ProjectPanel from '../components/ProjectPanel';
import ActivitiesBoard from '../components/Activities/ActivitiesBoard';

import { Resource } from '@bbp/nexus-sdk';

type ActivityResource = Resource<{
  parent?: {
    '@id': string;
  };
  name: string;
  //[key: string]: any;
}>;

type BreadcrumbItem = {
  label: string;
  url: string;
};

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
  const [breadcrumbs, setBreadcrumbs] = React.useState<BreadcrumbItem[]>([]);

  const projectLabel = match?.params.projectLabel;
  const orgLabel = match?.params.orgLabel;
  // const activityId = match?.params.activityId;
  const activityId = 'ceede3fc-e033-4c1c-8aca-54a9c0132507';

  const activityToBreadcrumbItem = (activity: ActivityResource) => ({
    label: activity.name,
    url: `/projects/${orgLabel}/${projectLabel}/${activity['@id']}`,
  });

  const fetchBreadcrumbs = (
    orgLabel: string,
    projectLabel: string,
    activity: ActivityResource,
    setBreadcrumbs: (items: BreadcrumbItem[]) => void
  ) => {
    const fetchNext = (activity: ActivityResource, acc: BreadcrumbItem[]) => {
      if (activity.parent) {
        nexus.Resource.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(activity.parent['@id'])
        ).then(response => {
          const activityResource = response as ActivityResource;
          fetchNext(activityResource, [
            activityToBreadcrumbItem(activityResource),
            ...acc,
          ]);
        });
      } else {
        const homeCrumb = {
          label: 'Project Home',
          url: `/projects/${orgLabel}/${projectLabel}`,
        };

        setBreadcrumbs([homeCrumb, ...acc]);
      }
    };

    fetchNext(activity, [activityToBreadcrumbItem(activity)]);
  };

  React.useEffect(() => {
    if (orgLabel && projectLabel) {
      nexus.Resource.get(orgLabel, projectLabel, encodeURIComponent(activityId))
        .then(response => {
          setActivity(response);
          fetchBreadcrumbs(
            orgLabel,
            projectLabel,
            response as ActivityResource,
            setBreadcrumbs
          );
        })
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
          {breadcrumbs.map(item => (
            <Breadcrumb.Item key={item.label} href={item.url}>
              {item.label}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}
      <ActivitiesBoard activities={activities} />
    </div>
  );
};

export default ActivityView;
