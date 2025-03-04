import React, { useMemo, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router';
import { Table, Button, Spin, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { AccessControl, useNexusContext } from '@bbp/react-nexus';
import { useQuery } from 'react-query';
import { NexusClient, Storage } from '@bbp/nexus-sdk/es';
import moment from 'moment';
import HasNoPermission from '../../../../shared/components/Icons/HasNoPermission';

import './styles.scss';

type Props = {};
type StorageData = {
  maxFileSize?: number;
  capacity?: number;
  files: number;
  spaceUsed: number;
  '@id': string;
};
type TDataType = {
  id: string;
  name: string;
  maxFileSize?: string;
  writePermission: string;
  type: string[];
  createdAt: string;
};
function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = [
    'Bytes',
    'KiB',
    'MiB',
    'GiB',
    'TiB',
    'PiB',
    'EiB',
    'ZiB',
    'YiB',
  ];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

const parseResponses = (storagesData: Storage[]): TDataType[] => {
  return storagesData.map(storage => {
    return {
      name: storage.name,
      maxFileSize: formatBytes(Number(storage.maxFileSize), 2),
      writePermission: storage.writePermission,
      type: storage['@type'].filter((t: string) => t !== 'Storage'),
      createdAt: storage._createdAt,
      id: storage['@id'],
    };
  });
};

const fetchStorages = async ({
  nexus,
  orgLabel,
  projectLabel,
}: {
  nexus: NexusClient;
  orgLabel: string;
  projectLabel: string;
}): Promise<TDataType[] | Error> => {
  try {
    const storagesList = await nexus.Storage.list(orgLabel, projectLabel);
    const storages = await Promise.all(
      storagesList._results.map(storage => {
        return nexus.Storage.get(
          orgLabel,
          projectLabel,
          encodeURIComponent(storage['@id'])
        );
      })
    );
    // @ts-ignore
    const storagesData = parseResponses(storages);
    return storagesData;
  } catch (error) {
    console.log('@@error', error);
    // @ts-ignore
    throw new Error('Can not load the storages', { cause: error });
  }
};
const StoragesSubView = (props: Props) => {
  const handleOnEdit = () => {};
  const history = useHistory();
  const nexus = useNexusContext();
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId?: string;
  }>();

  const {
    params: { orgLabel, projectLabel },
  } = match;
  const createNewStorageHandler = () => {
    const queryURI = `/orgs/${orgLabel}/${projectLabel}/create`;
    history.push(queryURI);
  };
  const columns: ColumnsType<TDataType> = useMemo(
    () => [
      {
        key: 'name',
        dataIndex: 'name',
        title: 'Name',
        render: text => <span>{text}</span>,
      },
      {
        key: 'type',
        dataIndex: 'type',
        title: 'Type',
        render: text => <span>{text}</span>,
      },
      {
        key: 'maxFileSize',
        dataIndex: 'maxFileSize',
        title: 'Max File Size',
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
        key: 'writePermission',
        dataIndex: 'writePermission',
        title: 'Write Permission',
        align: 'center',
        render: text => <span>{text}</span>,
      },
      {
        key: 'createdAt',
        dataIndex: 'createdAt',
        title: 'Created Date',
        align: 'center',
        render: text => <span>{moment(text).fromNow(false)}</span>,
      },
    ],
    []
  );

  const { data: storagesData, status } = useQuery({
    queryKey: [`storages-${orgLabel}-${projectLabel}`],
    queryFn: () => fetchStorages({ nexus, orgLabel, projectLabel }),
  });

  return (
    <div className="settings-view settings-storages-view">
      <h2>Storages</h2>
      <div className="settings-view-container">
        <AccessControl
          path={[`${orgLabel}/${projectLabel}`]}
          permissions={['storages/write']}
          noAccessComponent={() => (
            <Tooltip title="You have no permissions to create storage in this project">
              <HasNoPermission />
            </Tooltip>
          )}
        >
          <Button
            style={{ maxWidth: 150, margin: 0, marginTop: 20 }}
            type="primary"
            htmlType="button"
            onClick={createNewStorageHandler}
          >
            Create Storage
          </Button>
        </AccessControl>
        <Spin spinning={status === 'loading'}>
          {status === 'success' && (
            <Table<TDataType>
              className="views-table"
              rowClassName="view-item-row"
              columns={columns}
              dataSource={(storagesData as TDataType[]) ?? []}
              rowKey={item => item.id}
              sticky={true}
              size="small"
              pagination={false}
            />
          )}
        </Spin>
      </div>
    </div>
  );
};

export default StoragesSubView;
