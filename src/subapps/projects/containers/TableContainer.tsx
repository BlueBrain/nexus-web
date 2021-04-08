import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Modal, Button } from 'antd';

import EditTableForm from '../components/EditTableForm';
import { isTable } from '../utils';
import { TableComponent } from './NewTableContainer';
import { displayError, successNotification } from '../components/Notifications';
import DataTableContainer from '../../../shared/containers/DataTableContainer';

const TableContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  stepId: string;
}> = ({ orgLabel, projectLabel, stepId }) => {
  const nexus = useNexusContext();

  const [tables, setTables] = React.useState<any[] | undefined>([]);
  const [showEditForm, setShowEditForm] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);

  React.useEffect(() => {
    // this is temporary so we can test things
    // not sure where we place a Table yet
    nexus.Resource.links(
      orgLabel,
      projectLabel,
      encodeURIComponent(stepId),
      'incoming'
    )
      .then(response =>
        Promise.all(
          response._results
            .filter(link => isTable(link))
            .map(link => {
              return nexus.Resource.get(
                orgLabel,
                projectLabel,
                encodeURIComponent(link['@id'])
              );
            })
        )
          .then(response => {
            setTables(response);
          })
          .catch(error => {
            displayError(error, 'Failed to load tables');
          })
      )
      .catch(error => {
        displayError(error, 'Failed to load tables');
      });
  }, [orgLabel, projectLabel, stepId]);

  const updateTable = (data: TableComponent) => {
    setBusy(true);

    nexus.Resource.update(
      orgLabel,
      projectLabel,
      encodeURIComponent(data['@id']),
      data._rev,
      data
    )
      .then(success => {
        setBusy(false);
        setShowEditForm(false);
        successNotification('The table is updated successfully');
      })
      .catch(error => {
        displayError(error, 'Failed to update the Table');
        setBusy(false);
      });
  };

  // this is temporary so we can test things
  return (
    <div>
      {tables && tables.length > 0 && (
        <div key={`table-${tables[0]['@id']}`}>
          {' '}
          <DataTableContainer
            orgLabel={orgLabel}
            projectLabel={projectLabel}
            tableResourceId={tables[0]['@id']}
            editTableHandler={() => {
              setShowEditForm(true);
            }}
          ></DataTableContainer>
          <Modal
            visible={showEditForm}
            footer={null}
            onCancel={() => setShowEditForm(false)}
            width={800}
            destroyOnClose={true}
          >
            <EditTableForm
              onSave={updateTable}
              onClose={() => setShowEditForm(false)}
              table={tables[0]}
              busy={busy}
            />
          </Modal>
        </div>
      )}
    </div>
  );
};

export default TableContainer;
