import * as React from 'react';
import { Link } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import { DEFAULT_SPARQL_VIEW_ID } from '@bbp/nexus-sdk';
import { useSelector } from 'react-redux';
import { notification, Modal } from 'antd';

import DashboardConfigEditor, {
  DashboardPayload,
} from '../../components/DashboardEditor/DashboardConfigEditor';
import STUDIO_CONTEXT from '../../components/Studio/StudioContext';
import { DASHBOARD_TYPE } from './CreateDashboardContainer';
import { RootState } from '../../store/reducers';

const DashboardEditorContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  dashboardId: string;
  dashboardRev: number;
  dashboard: DashboardPayload;
  viewId?: string;
  showEditModal: boolean;
  setShowEditModal(showEditModal: boolean): void;
  onSuccess?(): void;
}> = ({
  orgLabel,
  projectLabel,
  dashboard,
  dashboardId,
  dashboardRev,
  showEditModal,
  setShowEditModal,
  onSuccess,
  viewId = DEFAULT_SPARQL_VIEW_ID,
}) => {
  const nexus = useNexusContext();
  const { label, description, dataQuery } = dashboard;
  const [busy, setBusy] = React.useState(false);
  const plugins = useSelector((state: RootState) => state.config.plugins) || [];

  // Launch modal when id is changed (someone selected a new dashboard to edit)
  React.useEffect(() => {
    if (!showEditModal) {
      setShowEditModal(true);
    }
  }, [viewId, dashboardId]);

  const handleSubmit = async (dashboardPayload: DashboardPayload) => {
    try {
      setBusy(true);
      await nexus.Resource.update(
        orgLabel,
        projectLabel,
        encodeURIComponent(dashboardId),
        dashboardRev,
        {
          ...dashboardPayload,
          '@context': STUDIO_CONTEXT['@id'],
          '@type': DASHBOARD_TYPE,
        }
      );

      setShowEditModal(false);
      !!onSuccess && onSuccess();
    } catch (error) {
      notification.error({
        message: `Could not update dashboard`,
        description: error.reason || error.message,
      });
    } finally {
      setBusy(false);
    }
  };

  const formatPluginSource = () => {
    return plugins.map(plugin => ({
      key: plugin,
      title: plugin,
      description: `description of ${plugin}`,
      chosen: false,
    }));
  };

  return (
    <Modal
      title={`Edit ${label || 'Dashboard'}`}
      visible={showEditModal}
      onCancel={() => setShowEditModal(false)}
      style={{ minWidth: '75%' }}
      confirmLoading={busy}
      footer={null}
    >
      <DashboardConfigEditor
        dashboard={{
          label,
          description,
          dataQuery,
          plugins: [],
        }}
        availablePlugins={formatPluginSource()}
        onSubmit={handleSubmit}
        linkToSparqlQueryEditor={(dataQuery: string) => {
          return (
            <Link
              to={`/${orgLabel}/${projectLabel}/${viewId}/sparql?query=${encodeURIComponent(
                dataQuery
              )}`}
              target="_blank"
            >
              View query in Sparql Editor
            </Link>
          );
        }}
      ></DashboardConfigEditor>
    </Modal>
  );
};

export default DashboardEditorContainer;
