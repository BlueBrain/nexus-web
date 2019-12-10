import * as React from 'react';
import { Link } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import { DEFAULT_SPARQL_VIEW_ID } from '@bbp/nexus-sdk';
import { notification, Modal, Button } from 'antd';

import DashboardConfigEditor, {
  DashboardConfigEditorProps,
} from '../../components/DashboardEditor/DashboardConfigEditor';
import STUDIO_CONTEXT from '../../components/Studio/StudioContext';

export const DASHBOARD_TYPE = 'StudioDashboard';

const CreateDashboardContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  viewId?: string;
}> = ({ orgLabel, projectLabel, viewId = DEFAULT_SPARQL_VIEW_ID }) => {
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const formRef = React.useRef<DashboardConfigEditorProps>(null);
  const nexus = useNexusContext();
  const [busy, setBusy] = React.useState(false);

  const handleSubmit = async () => {
    if (formRef.current && formRef.current.form) {
      formRef.current.form.validateFields();
      const validationErrors = Object.values(
        formRef.current.form.getFieldsError()
      ).filter(Boolean);
      // Invalid Form
      if (validationErrors.length) {
        return;
      }
      try {
        const dashboardPayload = formRef.current.form.getFieldsValue() as {
          description?: string;
          label: string;
          dataQuery: string;
        };
        setBusy(true);
        await nexus.Resource.create(orgLabel, projectLabel, {
          ...dashboardPayload,
          '@context': STUDIO_CONTEXT['@id'],
          '@type': DASHBOARD_TYPE,
        });

        // TODO: find a better way to trigger dashboard reloads
        // So that recently edited dashboards can appear
        // having the correct values
        location.reload();
      } catch (error) {
        notification.error({
          message: `Could not create dashboard`,
          description: error.reason || error.message,
        });
      } finally {
        setBusy(false);
      }
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
        onOk={() => handleSubmit()}
        okText={busy ? 'Saving' : 'Save'}
        style={{ minWidth: '75%' }}
        confirmLoading={busy}
      >
        <DashboardConfigEditor
          wrappedComponentRef={formRef}
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
