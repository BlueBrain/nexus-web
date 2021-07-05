import * as React from 'react';
import { Collapse } from 'antd';
import { Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import TableViewer from '../components/TableViewer';

const { Panel } = Collapse;

const TableViewerContainer: React.FC<{
  resource: Resource;
  orgLabel: string;
  projectLabel: string;
}> = ({ resource, orgLabel, projectLabel }) => {
  const nexus = useNexusContext();

  if (resource['@type'] !== 'File') {
    return null;
  } else {
    if (resource._mediaType === 'text/csv') {
      //download and parse
      const id = '???';

      nexus.File.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(resource['@id']),
        { as: 'text' }
      )
        .then(response => console.log('response', response))
        .catch(error => console.log('error'));
    }
  }

  return (
    <Collapse onChange={() => {}}>
      <Panel header="Table Viewer" key="1">
        <TableViewer />
      </Panel>
    </Collapse>
  );
};

export default TableViewerContainer;
