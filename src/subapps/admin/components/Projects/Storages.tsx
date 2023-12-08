import './Storages.scss';

import { Table } from 'antd';
import * as React from 'react';

import { labelOf } from '../../../../shared/utils';
import { StorageData } from '../../containers/StoragesContainer';

const Storages: React.FC<{ storages: StorageData[] }> = ({ storages }) => {
  const columns = [
    {
      title: 'Storage',
      dataIndex: 'storage',
    },
    {
      title: 'Max file size, GB',
      dataIndex: 'maxFileSize',
    },
    {
      title: 'Total files',
      dataIndex: 'files',
    },
    {
      title: 'Space used, GB',
      dataIndex: 'spaceUsed',
    },
    {
      title: 'Capacity, GB',
      dataIndex: 'capacity',
    },
  ];

  const bytesToGb = (bytes: number) => {
    return (bytes / 1073741824).toFixed(2);
  };

  const data = storages.map((storage) => ({
    capacity: storage.capacity ? bytesToGb(storage.capacity) : 'Undefined',
    maxFileSize: storage.maxFileSize ? bytesToGb(storage.maxFileSize) : 'Undefined',
    files: storage.files,
    spaceUsed: bytesToGb(storage.spaceUsed),
    key: storage['@id'],
    storage: labelOf(storage['@id']),
  }));

  if (storages.length < 1) return null;

  return (
    <div className="storages">
      <h3 className="storages__title">Storages</h3>
      <Table columns={columns} dataSource={data} size="small" pagination={false} />
    </div>
  );
};

export default Storages;
