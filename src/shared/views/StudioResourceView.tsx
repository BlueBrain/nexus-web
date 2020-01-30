import * as React from 'react';
import { useParams, useHistory } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { notification, Empty } from 'antd';
import * as queryString from 'query-string';

import { NexusPlugin } from '../containers/NexusPlugin';
import { labelOf, getOrgAndProjectFromResource } from '../utils';

type DashboardResource = {
  label?: string;
  description?: string;
  plugins?: string[];
  [key: string]: any;
};

type QueryParams = {
  [key: string]: any;
};

const StudioResourceView: React.FunctionComponent<{}> = () => {
  const nexus = useNexusContext();
  const { orgLabel, projectLabel, resourceId = '' } = useParams();
  const history = useHistory();
  const queryParams: QueryParams =
    queryString.parse(history.location.search) || {};
  const dashboardUrl = queryParams.dashboard;
  const [{ dashboard }, setDashboard] = React.useState<{
    dashboard: DashboardResource | null;
  }>({
    dashboard: null,
  });
  const [{ resource }, setResource] = React.useState<{
    resource: any | null;
  }>({
    resource: null,
  });

  React.useEffect(() => {
    setDashboard({
      dashboard,
    });

    setResource({
      resource,
    });

    // nexus
    //   .httpGet({
    //     path: decodeURIComponent(resourceSelfUrl),
    //     headers: { Accept: 'application/json' },
    //   })
    //   .then(resource => {
    //     setResource({ resource });
    //   })
    //   .catch(error => {
    //     notification.error({
    //       message: `Could not load Resource`,
    //       description: error.message,
    //     });
    //   });

    nexus
      .httpGet({
        path: dashboardUrl,
        headers: { Accept: 'application/json' },
      })
      .then(dashboard => {
        setDashboard({ dashboard });
      })
      .catch(error => {
        notification.error({
          message: `Could not load Dashboard`,
          description: error.message,
        });
      });
  }, [resourceId, dashboardUrl]);

  const goToStudioResource = (selfUrl: string) => {
    const studioResourceViewLink = `/${orgLabel}/${projectLabel}/studios/studio-resources/${encodeURIComponent(
      resourceId
    )}?dashboard=${dashboardUrl}`;

    history.push(studioResourceViewLink);
  };

  if (!dashboard || !resource) return null;

  const { plugins } = dashboard;
  const label = labelOf(resource['@id']);

  return (
    <div className="studio-resource-view">
      <h1>{label}</h1>
      <p>{resource.description}</p>
      {plugins && plugins.length > 0 ? (
        plugins.map(pluginName => (
          <div className="studio-resource-plugin" key={`plugin-${pluginName}`}>
            <NexusPlugin
              url={`/public/plugins/${pluginName}/index.js`}
              nexusClient={nexus}
              resource={resource}
              goToResource={goToStudioResource}
            />
          </div>
        ))
      ) : (
        <Empty description="No plugins configured" />
      )}
    </div>
  );
};

export default StudioResourceView;
