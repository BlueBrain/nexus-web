import * as React from 'react';
import { useParams, useHistory } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { notification } from 'antd';
import * as queryString from 'query-string';

import Dashboard from '../components/Studio/Dashboard';

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
  const { orgLabel = '', projectLabel = '', resourceId = '' } = useParams();
  const history = useHistory();
  const queryParams: QueryParams =
    queryString.parse(history.location.search) || {};
  const { dashboardId } = queryParams;
  const [{ dashboard, busy, error }, setState] = React.useState<{
    dashboard: DashboardResource | null;
    busy: boolean;
    error: Error | null;
  }>({
    dashboard: null,
    busy: false,
    error: null,
  });

  React.useEffect(() => {
    setState({
      dashboard,
      error: null,
      busy: true,
    });

    nexus.Resource.get(orgLabel, projectLabel, encodeURIComponent(dashboardId))
      .then(response => {
        setState({
          dashboard: response,
          busy: false,
          error: null,
        });
      })
      .catch(error => {
        notification.error({
          message: `Could not load dashboard ${projectLabel}`,
          description: error.message,
        });
        setState({
          dashboard,
          error,
          busy: false,
        });
      });
  }, [orgLabel, projectLabel]);

  if (!dashboard) return null;

  const { label, description, plugins } = dashboard;

  return (
    <Dashboard
      label={label}
      description={description}
      plugins={plugins}
      resourceId={resourceId}
    />
  );
};

export default StudioResourceView;
