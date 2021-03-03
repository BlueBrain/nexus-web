import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Modal, Button } from 'antd';

import EditTableForm from '../components/EditTableForm';
import { isTable } from '../utils';

const TableContainer: React.FC<{
  orgLabel: string;
  projectLabel: string;
  stepId: string;
}> = ({ orgLabel, projectLabel, stepId }) => {
  const nexus = useNexusContext();
  const [tables, setTables] = React.useState<any[] | undefined>([]);
  const [showEditForm, setShowEditForm] = React.useState<boolean>(false);

  React.useEffect(() => {
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
            console.log('response', response);
          })
          .catch(error => {
            // display error
          })
      )
      .catch(error => {
        // display error
      });
  }, []);

  const updateTable = () => {};

  // this is temporary so we can test things
  return (
    <div>
      {tables &&
        tables.length > 0 &&
        tables.map(table => (
          <div key={`table-${table['@id']}`}>
            {table.name}
            <Button onClick={() => setShowEditForm(true)} type="link">
              Edit Table
            </Button>
            <Modal
              visible={showEditForm}
              footer={null}
              onCancel={() => setShowEditForm(false)}
              width={800}
              destroyOnClose={true}
            >
              <EditTableForm
                onSave={updateTable}
                onClose={() => setShowEditForm(true)}
                table={table}
              />
            </Modal>
          </div>
        ))}
    </div>
  );
};

export default TableContainer;
