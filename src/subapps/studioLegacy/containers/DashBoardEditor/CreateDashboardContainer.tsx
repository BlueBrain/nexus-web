import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { DEFAULT_SPARQL_VIEW_ID, Resource } from '@bbp/nexus-sdk';
import { Modal, message } from 'antd';
import DashboardConfigEditor, {
  DashboardPayload,
} from '../../components/DashboardEditor/DashboardConfigEditor';
import useLinkToDashboardQueryEditor from './hooks/useLinkToDashboardQueryEditor';
import STUDIO_CONTEXT from '../../components/StudioContext';
import usePlugins from '../../../../shared/hooks/usePlugins';
import useNotification from '../../../../shared/hooks/useNotification';
import { TError } from '../../../../utils/types';

export const DASHBOARD_TYPE = 'StudioDashboard';

const CreateDashboardContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  workspaceId: string;
  viewId?: string;
  showCreateModal: boolean;
  onCancel(): void;
  onSuccess?(): void;
}> = ({
  orgLabel,
  projectLabel,
  workspaceId,
  showCreateModal,
  viewId = DEFAULT_SPARQL_VIEW_ID,
  onCancel,
  onSuccess,
}) => {
  const nexus = useNexusContext();
  const [busy, setBusy] = React.useState(false);
  const notification = useNotification();

  const pluginManifest = usePlugins();
  const availablePlugins = Object.keys(pluginManifest || {});
  const { linkQueryEditor, view } = useLinkToDashboardQueryEditor(
    viewId,
    orgLabel,
    projectLabel
  );

  const onSubmit = () => {
    setBusy(false);
    !!onSuccess && onSuccess();
  };

  const handleSubmit = async (dashboardPayload: DashboardPayload) => {
    try {
      setBusy(true);
      onCancel();
      const dashboard = await nexus.Resource.create(orgLabel, projectLabel, {
        ...dashboardPayload,
        '@context': STUDIO_CONTEXT['@id'],
        '@type': DASHBOARD_TYPE,
      });
      // Add dashboard to workspace
      const workspace = (await nexus.Resource.get<Resource>(
        orgLabel,
        projectLabel,
        encodeURIComponent(workspaceId)
      )) as Resource;
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
        description: (error as TError).reason || (error as TError).message,
      });
    } finally {
      onSubmit();
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Create Dashboard"
      open={showCreateModal}
      onCancel={onCancel}
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
  );
};

export default CreateDashboardContainer;
