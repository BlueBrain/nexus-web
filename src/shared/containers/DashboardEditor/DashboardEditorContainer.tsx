import * as React from 'react';
import DashboardConfigEditor from '../../components/DashboardEditor/DashboardConfigEditor';
import { useNexus } from '@bbp/react-nexus';
import { ViewList } from '@bbp/nexus-sdk';

const DashboardEditorContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  viewId: string;
  dashboardId: string;
}> = ({ orgLabel, projectLabel, viewId, dashboardId }) => {
  const viewListState = useNexus<ViewList>(nexus =>
    nexus.View.list(orgLabel, projectLabel, {})
  );

  const dashboardState = useNexus<ViewList>(nexus =>
    nexus.Resource.get(orgLabel, projectLabel, dashboardId, {})
  );

  const dashboardViewParing = {
    dashboard: {},
    view: {
      '@id': viewId,
    },
  };

  const handleSubmit = async () => {};

  return !!dashboardState.data && !!viewListState.data._total ? null : null;
};

export default DashboardEditorContainer;
