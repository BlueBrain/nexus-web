import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { DEFAULT_SPARQL_VIEW_ID, Resource } from '@bbp/nexus-sdk';
import { notification, Modal, Button, message } from 'antd';
import { PlusSquareOutlined } from '@ant-design/icons';
import DashboardConfigEditor, {
  DashboardPayload,
} from '../../components/DashboardEditor/DashboardConfigEditor';
import useLinkToDashboardQueryEditor from './hooks/useLinkToDashboardQueryEditor';
import STUDIO_CONTEXT from '../../components/StudioContext';
import usePlugins from '../../../../shared/hooks/usePlugins';

export const DASHBOARD_TYPE = 'StudioDashboard';

const CreateDashboardContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  workspaceId: string;
  viewId?: string;
  onSuccess?(): void;
}> = ({
  orgLabel,
  projectLabel,
  workspaceId,
  viewId = DEFAULT_SPARQL_VIEW_ID,
  onSuccess,
}) => {
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const nexus = useNexusContext();
  const [busy, setBusy] = React.useState(false);

  const pluginManifest = usePlugins();
  const availablePlugins = Object.keys(pluginManifest || {});
  const { linkQueryEditor, view } = useLinkToDashboardQueryEditor(
    viewId,
    orgLabel,
    projectLabel
  );

  const onSubmit = () => {
    setBusy(false);
    setShowCreateModal(false);
    !!onSuccess && onSuccess();
  };

  const handleSubmit = async (dashboardPayload: DashboardPayload) => {
    try {
      setBusy(true);

      const dashboard = await nexus.Resource.create(orgLabel, projectLabel, {
        ...dashboardPayload,
        '@context': STUDIO_CONTEXT['@id'],
        '@type': DASHBOARD_TYPE,
      });
      // Add dashboard to workspace
      const workspace = await nexus.Resource.get<Resource>(
        orgLabel,
        projectLabel,
        encodeURIComponent(workspaceId)
      );
      const workspaceSource = await nexus.Resource.getSource<{
        [key: string]: any;
      }>(orgLabel, projectLabel, encodeURIComponent(workspaceId));
      if (workspace) {
        await nexus.Resource.update(
          orgLabel,
          projectLabel,
          encodeURIComponent(workspaceId),
          workspace._rev,
          {
            ...workspaceSource,
            dashboards: [
              ...workspaceSource.dashboards,
              {
                dashboard: dashboard['@id'],
                view: viewId,
              },
            ],
          }
        );
      }

      message.success(
        <span>
          Dashboard <em>{dashboardPayload.label}</em> created
        </span>
      );

      onSubmit();
    } catch (error) {
      notification.error({
        message: `Could not create dashboard`,
        description: error.reason || error.message,
      });
    } finally {
      onSubmit();
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        icon={<PlusSquareOutlined />}
        onClick={() => setShowCreateModal(true)}
      >
        Add Dashboard
      </Button>
      <Modal
        title="Create Dashboard"
        visible={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        style={{ minWidth: '75%' }}
        confirmLoading={busy}
        footer={null}
        destroyOnClose={true}
        key={workspaceId}
      >
        <DashboardConfigEditor
          availablePlugins={availablePlugins}
          onSubmit={handleSubmit}
          linkToSparqlQueryEditor={linkQueryEditor}
          view={view}
        ></DashboardConfigEditor>
      </Modal>
    </>
  );
};

export default CreateDashboardContainer;
