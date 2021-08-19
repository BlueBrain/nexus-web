import * as React from 'react';
import { Table } from 'antd';

import { labelOf } from '../../../../shared/utils';
import { StorageData } from '../../containers/StoragesContainer';

import './Storages.less';

const Storages: React.FC<{ storages: StorageData[] }> = ({ storages }) => {
  const columns = [
    {
      title: 'Storage',
      dataIndex: 'storage',
    },
    {
      title: 'Max file size',
      dataIndex: 'maxFileSize',
    },
    {
      title: 'Total files',
      dataIndex: 'files',
    },
    {
      title: 'Space used',
      dataIndex: 'spaceUsed',
    },
    {
      title: 'Capacity',
      dataIndex: 'capacity',
    },
  ];

  const data = storages.map(storage => ({
    capacity: storage.capacity || 'Undefined',
    maxFileSize: storage.maxFileSize,
    files: storage.files,
    spaceUsed: storage.spaceUsed,
    key: storage['@id'],
    storage: labelOf(storage['@id']),
  }));

  if (!storages || storages.length < 1) return null;

  return (
    <div className="storages">
      <h3 className="storages__title">Storages</h3>
      <Table
        columns={columns}
        dataSource={data}
        size="small"
        pagination={false}
      />
    </div>
  );
};

export default Storages;
