import * as React from 'react';
import { Modal } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import * as csvParser from 'csv-string';

import TableViewer from '../components/TableViewer';
import useNotification from '../hooks/useNotification';
import { parseResourceId } from '../../shared/components/Preview/Preview';

const TableViewerContainer: React.FC<{
  resourceUrl: string;
  name: string;
  orgLabel: string;
  projectLabel: string;
  onClickClose: () => void;
}> = ({ resourceUrl, orgLabel, projectLabel, name, onClickClose }) => {
  const nexus = useNexusContext();
  const [tableData, setTableData] = React.useState<string[][]>();
  const notification = useNotification();

  React.useEffect(() => {
    loadTable();
  }, []);

  const loadTable = async () => {
    const resourceId = parseResourceId(resourceUrl);
    let contentUrl = resourceId;
    await nexus.File.get(
      orgLabel,
      projectLabel,
      encodeURIComponent(contentUrl),
      {
        as: 'text',
      }
    )
      .then(response => {
        const tableData = csvParser.parse(response as string);
        
        setTableData(tableData);
      })
      .catch(() => {
        notification.error({
          message: 'Failed to load file',
        });
      });
  };

  if (!tableData) return null;

  return (
    <Modal
      destroyOnClose
      maskClosable
      visible
      width={900}
      footer={null}
      onCancel={onClickClose}
    >
      <TableViewer name={name} data={tableData} />
    </Modal>
  );
};

export default TableViewerContainer;
