import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { DEFAULT_SPARQL_VIEW_ID, View } from '@bbp/nexus-sdk';
import { Modal, message, Spin } from 'antd';

import useLinkToDashboardQueryEditor from './hooks/useLinkToDashboardQueryEditor';

import DashboardConfigEditor, {
  DashboardPayload,
} from '../../components/DashboardEditor/DashboardConfigEditor';
import STUDIO_CONTEXT from '../../components/StudioContext';
import { DASHBOARD_TYPE } from './CreateDashboardContainer';
import usePlugins from '../../../../shared/hooks/usePlugins';
import useAsyncCall from '../../../../shared/hooks/useAsynCall';
import useNotification from '../../../../shared/hooks/useNotification';

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
  const { label, description, dataQuery, plugins } = dashboard;
  const notification = useNotification();

  const [busy, setBusy] = React.useState(false);
  const pluginManifest = usePlugins();
  const availablePlugins = Object.keys(pluginManifest || {});

  const { linkQueryEditor } = useLinkToDashboardQueryEditor(
    viewId,
    orgLabel,
    projectLabel
  );
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

      message.success(
        <span>
          Dashboard <em>{dashboardPayload.label}</em> updated
        </span>
      );

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

  const viewData = useAsyncCall<View, Error>(
    nexus.View.get(orgLabel, projectLabel, viewId),
    [orgLabel, projectLabel, encodeURIComponent(viewId)]
  );

  return (
    <Modal
      title={`Edit ${label || 'Dashboard'}`}
      open={showEditModal}
      onCancel={() => setShowEditModal(false)}
      style={{ minWidth: '75%' }}
      confirmLoading={busy}
      footer={null}
      destroyOnClose={true}
    >
      <Spin spinning={viewData.loading}>
        <DashboardConfigEditor
          view={viewData.data || undefined}
          availablePlugins={availablePlugins}
          dashboard={{
            label,
            description,
            dataQuery,
            plugins,
          }}
          onSubmit={handleSubmit}
          linkToSparqlQueryEditor={linkQueryEditor}
        />
      </Spin>
    </Modal>
  );
};

export default DashboardEditorContainer;
