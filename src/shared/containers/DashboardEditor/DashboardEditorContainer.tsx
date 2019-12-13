import * as React from 'react';
import { Link } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import { DEFAULT_SPARQL_VIEW_ID } from '@bbp/nexus-sdk';
import { notification, Modal } from 'antd';

import DashboardConfigEditor, {
  DashboardPayload,
  DashboardConfigEditorProps,
} from '../../components/DashboardEditor/DashboardConfigEditor';
import STUDIO_CONTEXT from '../../components/Studio/StudioContext';
import { DASHBOARD_TYPE } from './CreateDashboardContainer';

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
  const formRef = React.useRef<DashboardConfigEditorProps>(null);
  const nexus = useNexusContext();
  const { label, description, dataQuery } = dashboard;
  console.log('dashboard', dashboard);
  
  const [busy, setBusy] = React.useState(false);

  // Launch modal when id is changed (someone selected a new dashboard to edit)
  React.useEffect(() => {
    if (!showEditModal) {
      setShowEditModal(true);
    }
  }, [viewId, dashboardId]);

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
    }
  };

  return (
    <Modal
      title={`Edit ${label || 'Dashboard'}`}
      visible={showEditModal}
      onCancel={() => setShowEditModal(false)}
      onOk={() => handleSubmit()}
      okText={busy ? 'Saving' : 'Save'}
      style={{ minWidth: '75%' }}
      confirmLoading={busy}
    >
      <DashboardConfigEditor
        wrappedComponentRef={formRef}
        dashboard={{
          label,
          description,
          dataQuery,
        }}
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
