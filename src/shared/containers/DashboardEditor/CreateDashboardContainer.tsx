import * as React from 'react';
import { Link } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import { DEFAULT_SPARQL_VIEW_ID, Resource } from '@bbp/nexus-sdk';
import { notification, Modal, Button } from 'antd';

import DashboardConfigEditor, {
  DashboardPayload,
} from '../../components/DashboardEditor/DashboardConfigEditor';
import STUDIO_CONTEXT from '../../components/Studio/StudioContext';

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
        workspaceId
      );

      const workspaceSource = await nexus.Resource.getSource<{
        [key: string]: any;
      }>(orgLabel, projectLabel, workspaceId);
      if (workspace) {
        await nexus.Resource.update(
          orgLabel,
          projectLabel,
          workspaceId,
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

      notification.success({
        message: `Dashboard ${dashboardPayload.label} was created successfully`,
        duration: 5,
      });

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
      <Button icon="plus" onClick={() => setShowCreateModal(true)}>
        Add Dashboard
      </Button>
      <Modal
        title="Create Dashboard"
        visible={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        style={{ minWidth: '75%' }}
        confirmLoading={busy}
        footer={null}
      >
        <DashboardConfigEditor
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
    </>
  );
};

export default CreateDashboardContainer;
