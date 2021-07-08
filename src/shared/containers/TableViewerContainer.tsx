import * as React from 'react';
import { Modal } from 'antd';
import { Resource, NexusFile } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import * as csvParser from 'csv-string';

import TableViewer from '../components/TableViewer';

const TableViewerContainer: React.FC<{
  resourceUrl: string;
  name: string;
  orgLabel: string;
  projectLabel: string;
}> = ({ resourceUrl, orgLabel, projectLabel, name }) => {
  const nexus = useNexusContext();
  const [tableData, setTableData] = React.useState<any>();
  const [showTable, setShowTable] = React.useState<boolean>(true);

  React.useEffect(() => {
    nexus.File.get(orgLabel, projectLabel, encodeURIComponent(resourceUrl), {
      as: 'text',
    })
      .then(response => {
        const tableData = csvParser.parse(response as string);

        setTableData(tableData);
      })
      .catch(error => console.log('error'));
  }, []);

  if (!tableData) return null;

  return (
    <Modal
      destroyOnClose
      maskClosable
      visible={showTable}
      width={900}
      footer={null}
      onCancel={() => setShowTable(false)}
    >
      <TableViewer name={name} data={tableData} />
    </Modal>
  );
};

export default TableViewerContainer;
