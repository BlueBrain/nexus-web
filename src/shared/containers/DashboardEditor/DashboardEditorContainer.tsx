import * as React from 'react';
import DashboardConfigEditor, {
  DashboardAndViewPairing,
} from '../../components/DashboardEditor/DashboardConfigEditor';
import { useNexus } from '@bbp/react-nexus';
import { ViewList } from '@bbp/nexus-sdk';
import { Spin } from 'antd';

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

  const handleSubmit = async (dashboardViewParing: DashboardAndViewPairing) => {
    createDashboard(dashboardViewParing);
  };

  return !!dashboardState.data && !!viewListState.data._total ? (
    <DashboardConfigEditor
      viewList={viewListState.data}
      onSubmit={handleSubmit}
      dashboardViewParing={dashboardViewParing}
    />
  ) : null;
};

export default DashboardEditorContainer;
