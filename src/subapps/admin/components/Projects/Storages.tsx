import * as React from 'react';
import { Table, Progress } from 'antd';
import { Storage } from '@bbp/nexus-sdk';

import './Storages.less';

const Storages: React.FC<{ storages: any[] }> = ({ storages }) => {
  console.log('storages', storages);

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
      title: 'Capacity',
      dataIndex: 'capacity',
    },
    {
      title: 'Space used',
      dataIndex: 'spaceUsed',
      render: (spaceUsed: number) => (
        <Progress
          percent={(spaceUsed / 20) * 100}
          format={() => `${spaceUsed} GB`}
          status="normal"
        />
      ),
      className: 'storages__space-used-column',
    },
  ];

  const data = [
    {
      key: '1',
      storage: 'diskStorageDefault',
      maxFileSize: `${(10737418240 / 1073741824).toFixed(2)} GB`,
      capacity: '20.00 GB',
      spaceUsed: (5000 / 1024).toFixed(2),
    },
    {
      key: '2',
      storage: 'testStorage',
      maxFileSize: `${(10737418240 / 1073741824).toFixed(2)} GB`,
      capacity: '20.00 GB',
      spaceUsed: (11000 / 1024).toFixed(2),
    },
  ];

  if (!storages) return null;

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
