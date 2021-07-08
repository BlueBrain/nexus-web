import * as React from 'react';
import { Modal } from 'antd';
import { Resource, NexusFile } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import * as csvParser from 'csv-string';

import TableViewer from '../components/TableViewer';

const TableViewerContainer: React.FC<{
  resource: Resource;
  orgLabel: string;
  projectLabel: string;
}> = ({ resource, orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const [tableData, setTableData] = React.useState<any>();
  const [showTable, setShowTable] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (resource['@type'] !== 'File') {
      return;
    }
    if (resource._mediaType === 'text/csv') {
      nexus.File.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(resource['@id']),
        { as: 'text' }
      )
        .then(response => {
          const tableData = csvParser.parse(response as string);

          setTableData(tableData);
        })
        .catch(error => console.log('error'));
    }
  }, []);

  if (!tableData) return null;

  return (
    <Modal
      visible={showTable}
      width={900}
      footer={null}
      onCancel={() => setShowTable(false)}
      maskClosable={true}
    >
      <TableViewer name={resource._filename} data={tableData} />
    </Modal>
  );
};

export default TableViewerContainer;
