import * as React from 'react';
import { useParams } from 'react-router';
import { useNexusContext } from '@bbp/react-nexus';
import { notification } from 'antd';

import Dashboard from '../components/Studio/Dashboard';

type DashboardResource = {
  label?: string;
  description?: string;
  plugins?: string[];
  [key: string]: any;
};

const StudioResourceView: React.FunctionComponent<{}> = () => {
  const nexus = useNexusContext();
  const { orgLabel = '', projectLabel = '', resourceId = '' } = useParams();

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

    nexus.Resource.get(orgLabel, projectLabel, resourceId)
      .then(response => {
        console.log('response', response);

        setState({
          dashboard: response,
          busy: false,
          error: null,
        });
      })
      .catch(error => {
        notification.error({
          message: `Could not load project ${projectLabel}`,
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
    <Dashboard label={label} description={description} plugins={plugins} />
  );
};

export default StudioResourceView;
