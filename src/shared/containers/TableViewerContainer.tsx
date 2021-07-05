import * as React from 'react';
import { Collapse } from 'antd';
import { Resource, NexusFile } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import * as csvParser from 'csv-string';

import TableViewer from '../components/TableViewer';

const { Panel } = Collapse;

const TableViewerContainer: React.FC<{
  resource: Resource;
  orgLabel: string;
  projectLabel: string;
}> = ({ resource, orgLabel, projectLabel }) => {
  const nexus = useNexusContext();
  const [tableData, setTableData] = React.useState<any>('');

  React.useEffect(() => {
    if (resource['@type'] !== 'File') {
      return;
    } else {
      if (resource._mediaType === 'text/csv') {
        nexus.File.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(resource['@id']),
          { as: 'text' }
        )
          .then(response => {
            console.log('response', response);

            parseCSV(response as string);
          })
          .catch(error => console.log('error'));
      }
    }
  }, []);

  const parseCSV = (rawData: string) => {
    const tableData = csvParser.parse(rawData);

    setTableData(tableData);
  };

  return (
    <Collapse onChange={() => {}}>
      <Panel header="Table Viewer" key="1">
        <TableViewer name={resource._filename} data={tableData} />
      </Panel>
    </Collapse>
  );
};

export default TableViewerContainer;
