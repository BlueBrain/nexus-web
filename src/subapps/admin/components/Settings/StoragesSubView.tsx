import React, { useMemo, useState, useEffect } from 'react';
import { useRouteMatch } from 'react-router';
import { Table, Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useNexusContext } from '@bbp/react-nexus';

import './SettingsView.less';

type Props = {};
type StorageData = {
  maxFileSize?: number;
  capacity?: number;
  files: number;
  spaceUsed: number;
  '@id': string;
};
type DataType = {
  key: string;
  location: string;
  type: string;
  default: string;
  endpoint: string;
  maxFileSize: string;
  read: string;
  write: string;
  deprecated: string;
};

const viewsSample: DataType[] = [
  {
    key: 'opt/binaries',
    location: 'opt/binaries',
    type: 'DiskStorageDefault',
    default: 'False',
    endpoint: '-',
    maxFileSize: '10 GB',
    read: 'resources/read',
    write: 'files/write',
    deprecated: 'files/write',
  },
  {
    key: 'prj109',
    location: 'prj109',
    type: 'RemoteStorageDefault',
    default: 'True',
    endpoint: 'http//storage.s3.com/prj109',
    maxFileSize: '33 GB',
    read: 'gpfs-prj109/read',
    write: 'gpfs-prj109/write',
    deprecated: 'files/write',
  },
];

const StoragesSubView = (props: Props) => {
  const handleOnEdit = () => { };
  const createNewStorageHandler = () => { };
  const nexus = useNexusContext();
  const [storages, setStorages] = useState<StorageData[]>([]);
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId?: string;
  }>();

  const { params: { orgLabel, projectLabel }, } = match;
  const columns: ColumnsType<DataType> = useMemo(() => [
    {
      key: 'location',
      dataIndex: 'location',
      title: 'Location',
      render: text => <span>{text}</span>,
    },
    {
      key: 'type',
      dataIndex: 'type',
      title: 'Type',
      render: text => <span>{text}</span>,
    },
    {
      key: 'default',
      dataIndex: 'default',
      title: 'Default',
      align: 'center',
      render: text => <span>{text}</span>,
    },
    {
      key: 'endpoint',
      dataIndex: 'endpoint',
      title: 'Endpoint',
      align: 'center',
      render: text => <span>{text}</span>,
    },
    {
      key: 'maxFileSize',
      dataIndex: 'maxFileSize',
      title: 'Maximum File Size',
      align: 'center',
      render: text => <span>{text}</span>,
    },
    {
      key: 'read',
      dataIndex: 'read',
      title: 'Read',
      align: 'center',
      render: text => <span>{text}</span>,
    },
    {
      key: 'write',
      dataIndex: 'write',
      title: 'Write',
      align: 'center',
      render: text => <span>{text}</span>,
    },
    {
      key: 'deprecated',
      dataIndex: 'deprecated',
      title: 'Deprecated',
      align: 'center',
      render: text => <span>{text}</span>,
    },
    {
      key: 'actions',
      dataIndex: 'actions',
      title: 'Actions',
      align: 'center',
      render: text => (
        <Button type="link" htmlType="button" onClick={handleOnEdit}>
          Edit
        </Button>
      ),
    },
  ], []);

  const data: DataType[] = viewsSample;
  
  useEffect(() => {
    const loadStorages = async () => {
      await nexus.Storage.list(orgLabel, projectLabel)
        .then(response => {
          Promise.all(
            response._results.map(storage => {
              return nexus.Storage.get(
                orgLabel,
                projectLabel,
                encodeURIComponent(storage['@id'])
              )
            })
          ).then(results => {
            setStorages(parseResponses(results));
          });
        })
        .catch(error => {
          // fail silently
        });
    };
    const parseResponses = (storagesData: any[]) => {
      return storagesData.map(storage => {
        const { maxFileSize, capacity } = storage[0];
        const { files, spaceUsed } = storage[1];
  
        return {
          maxFileSize,
          capacity,
          files,
          spaceUsed,
          '@id': storage[0]['@id'],
        };
      });
    };
    loadStorages();
  }, []);

  return (
    <div className="settings-view settings-storages-view">
      <h2>Storages</h2>
      <div className="settings-view-container">
        <Button
          style={{ maxWidth: 150, margin: 0, marginTop: 20 }}
          type="primary"
          disabled={false} // TODO: write premission to be enabled
          htmlType="button"
          onClick={createNewStorageHandler}
        >
          Create Storage
        </Button>
        <Table
          className="views-table"
          rowClassName="view-item-row"
          columns={columns}
          dataSource={data}
          sticky={true}
          size="small"
        />
      </div>
    </div>
  );
};

export default StoragesSubView;
