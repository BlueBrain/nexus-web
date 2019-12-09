import * as React from 'react';
import DashboardConfigEditor, {
  DashboardPayload,
  DashboardConfigEditorProps,
} from '../../components/DashboardEditor/DashboardConfigEditor';
import { useNexusContext } from '@bbp/react-nexus';
import { Link } from 'react-router-dom';
import { notification, Modal } from 'antd';
import { DEFAULT_SPARQL_VIEW_ID } from '@bbp/nexus-sdk';

const DashboardEditorContainer: React.FunctionComponent<{
  orgLabel: string;
  projectLabel: string;
  dashboardId: string;
  dashboardRev: number;
  dashboard: DashboardPayload;
  viewId?: string;
}> = ({
  orgLabel,
  projectLabel,
  dashboard,
  dashboardId,
  dashboardRev,
  viewId = DEFAULT_SPARQL_VIEW_ID,
}) => {
  const formRef = React.useRef<DashboardConfigEditorProps>(null);
  const nexus = useNexusContext();
  const { label, description, dataQuery } = dashboard;
  const [visible, setVisible] = React.useState(true);
  const [busy, setBusy] = React.useState(false);

  const handleSubmit = async () => {
    if (formRef.current && formRef.current.form) {
      console.log(formRef.current.form);
      formRef.current.form.validateFields();

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
          }
        );
        // TODO: find a better way to trigger dashboard reloads
        // So that recently edited dashboards can appear
        // having the correct values
        location.reload();
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
      visible={visible}
      onCancel={() => setVisible(false)}
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
