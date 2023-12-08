import './styles.scss';

import { Gauge } from '@ant-design/charts';
import { Quota } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import { Table } from 'antd';
import { ColumnsType } from 'antd/es/table';
import React, { useEffect, useMemo, useState } from 'react';
import { useRouteMatch } from 'react-router';

type Props = {};
type GaugeProps = {
  percent: number;
  name: string;
  total: number;
  quota: number;
};
type DataType = {
  key: string;
  storage: string;
  max_file_size: string;
  total_files: number;
  space_used: string;
  capacity: string;
};
const GaugeComponent = ({ percent, total, quota, name }: GaugeProps) => {
  return (
    <div className="quotas-gauge-chart">
      <Gauge
        className="qgauge-chart"
        width={200}
        height={200}
        percent={percent}
        range={{ color: '#1890ff' }}
        indicator={false}
        statistic={{
          content: {
            // @ts-ignore
            formatter: ({ percent }) => `${(percent * 100).toFixed(0)}%`,
            style: {
              color: '#333',
              fontSize: '40px',
              fontWeight: 'bolder',
            },
          },
        }}
      />
      <div className="qgauge-description">
        Total: {total} {name}{' '}
      </div>
      <div className="qgauge-description">
        Quota: {quota} {name}{' '}
      </div>
    </div>
  );
};

const QuotasSubView = (props: Props) => {
  const nexus = useNexusContext();
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId?: string;
  }>();

  const [quota, setQuota] = useState<Quota>();
  const {
    params: { orgLabel, projectLabel },
  } = match;

  const resources: GaugeProps = {
    name: 'Resources',
    quota: 100000,
    total: 89000,
    percent: 0.89,
  };
  const events: GaugeProps = {
    name: 'Events',
    quota: 30000,
    total: 11000,
    percent: 0.34,
  };

  const columns: ColumnsType<DataType> = useMemo(
    () => [
      {
        key: 'storage',
        dataIndex: 'storage',
        title: 'Storage',
        render: text => <span>{text}</span>,
      },
      {
        key: 'max_file_size',
        dataIndex: 'max_file_size',
        title: 'Max File Size (GB)',
        render: text => <span>{text}</span>,
      },
      {
        key: 'total_files',
        dataIndex: 'total_files',
        title: 'Total Files',
        align: 'center',
        render: text => <span>{text}</span>,
      },
      {
        key: 'space_used',
        dataIndex: 'space_used',
        title: 'Space Used',
        align: 'center',
        render: text => <span>{text}</span>,
      },
      {
        key: 'capacity',
        dataIndex: 'capacity',
        title: 'Capacity',
        align: 'center',
        render: text => <span>{text}</span>,
      },
    ],
    []
  );
  const data: DataType[] = [
    {
      key: 'diskDefaultStorage',
      storage: 'diskDefaultStorage',
      max_file_size: '10.00',
      total_files: 0,
      space_used: '0.00',
      capacity: 'Undefined',
    },
  ];
  useEffect(() => {
    const loadQuotas = async () => {
      await nexus.Quotas.get(orgLabel, projectLabel)
        .then((response: any) => {
          setQuota(response);
        })
        .catch(error => {
          // fail silently
        });
    };
    loadQuotas();
  }, []);

  return (
    <div className="settings-view settings-quotas-view">
      <h2>Quotas</h2>
      <div className="settings-view-container">
        <h3>Data Volume</h3>
        <div className="quota-data-volume">
          <GaugeComponent {...resources} />
          <GaugeComponent {...events} />
        </div>
        <h3>Storages</h3>
        <div className="quota-storage">
          <Table
            className="quota-storage-table"
            rowClassName="view-item-row"
            columns={columns}
            dataSource={data}
            sticky={true}
            size="middle"
          />
        </div>
      </div>
    </div>
  );
};

export default QuotasSubView;
