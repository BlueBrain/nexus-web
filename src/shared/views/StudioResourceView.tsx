import * as React from 'react';
import { useParams, useHistory, useLocation } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';
import { notification, Empty } from 'antd';
import * as queryString from 'query-string';

import { NexusPlugin } from '../containers/NexusPlugin';
import { getResourceLabel } from '../utils';

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
  const { resourceSelfUri = '' } = useParams();

  const history = useHistory();
  const location = useLocation();

  const queryParams: QueryParams = queryString.parse(location.search) || {};

  const dashboardUrl = queryParams.dashboard;
  const [dashboard, setDashboard] = React.useState<DashboardResource | null>();
  const [resource, setResource] = React.useState<Resource | null>();

  React.useEffect(() => {
    setDashboard(dashboard);
    setResource(resource);

    let resourceResponse;
    let dashboardResource;

    nexus
      .httpGet({
        path: atob(resourceSelfUri),
        headers: { Accept: 'application/json' },
      })
      .then(resource => {
        resourceResponse = resource;
        setResource(resourceResponse);
      })
      .catch(error => {
        notification.error({
          message: `Could not load Resource`,
          description: error.message,
        });
      });

    nexus
      .httpGet({
        path: dashboardUrl,
        headers: { Accept: 'application/json' },
      })
      .then(dashboard => {
        dashboardResource = dashboard;
        setDashboard(dashboardResource);
      })
      .catch(error => {
        notification.error({
          message: `Could not load Dashboard`,
          description: error.message,
        });
      });
  }, [resourceSelfUri, dashboardUrl]);

  const goToStudioResource = (selfUrl: string) => {
    const base64EncodedUri = btoa(selfUrl);
    const studioResourceViewLink = `/studios/studio-resources/${base64EncodedUri}?dashboard=${dashboardUrl}`;

    history.push(studioResourceViewLink, location.state);
  };

  if (!dashboard || !resource) return null;

  const plugins: string[] = !!dashboard.plugins
    ? Array.isArray(dashboard.plugins)
      ? dashboard.plugins
      : [dashboard.plugins]
    : [];

  const label = getResourceLabel(resource);

  console.log({ resourceSelfUri });

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
