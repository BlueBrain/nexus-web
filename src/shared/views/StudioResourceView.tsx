import * as React from 'react';
import { useParams, useHistory } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { notification, Empty } from 'antd';
import * as queryString from 'query-string';

import { NexusPlugin } from '../containers/NexusPlugin';

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
  const { resourceSelfUrl = '' } = useParams();
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

    nexus
      .httpGet({
        path: resourceSelfUrl,
        headers: { Accept: 'application/json' },
      })
      .then(resource => {
        setResource({ resource });
      })
      .catch(error => {
        // TODO: show a meaningful error to the user.
      });

    nexus
      .httpGet({
        path: dashboardUrl,
        headers: { Accept: 'application/json' },
      })
      .then(dashboard => {
        setDashboard({ dashboard });
      })
      .catch(error => {
        // TODO: show a meaningful error to the user.
      });
  }, []);

  if (!dashboard) return null;

  const { label, description, plugins } = dashboard;

  return (
    <div className="studio-resource-view">
      <h1>{label}</h1>
      <p>{description}</p>
      {plugins && plugins.length > 0 ? (
        plugins.map(pluginName => (
          <div className="studio-resource-plugin" key={`plugin-${pluginName}`}>
            <NexusPlugin
              url={`/public/plugins/${pluginName}/index.js`}
              nexusClient={nexus}
              resource={resource}
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
