import React, { useMemo } from 'react';
import { Table } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { TFilterOptions } from '../MyDataHeader/MyDataHeader';
import timeago from '../../../utils/timeago';
import './styles.less';


export type TDataSource = {
    key: string;
    name: string;
    project: string;
    description: string;
    type?: string | string[];
    updatedAt: string;
    createdAt: string;
}
type Props = {
    setFilterOptions: React.Dispatch<Partial<TFilterOptions>>,
    isLoading: boolean;
    dataSource: TDataSource[];
    offset: number;
    size: number;
    total?: number;
}

export default function MyDataTabel({
    setFilterOptions,
    isLoading,
    dataSource,
    size,
    offset,
    total,
}: Props) {
    const columns: ColumnsType<TDataSource> = useMemo(() => [
        {
            key: 'name',
            title: 'Name',
            dataIndex: 'name',
            fixed: true,
            sorter: (a, b) => a.name.length - b.name.length,
        }, {
            key: 'project',
            title: 'project',
            dataIndex: 'project',
            sorter: (a, b) => a.name.length - b.name.length,
        }, {
            key: 'description',
            title: 'description',
            dataIndex: 'description',
            sorter: (a, b) => a.name.length - b.name.length,
        }, {
            key: 'type',
            title: 'type',
            dataIndex: 'type',
            sorter: (a, b) => a.name.length - b.name.length,
        }, {
            key: 'updatedAt',
            title: 'updated date',
            dataIndex: 'updatedAt',
            width: 140,
            render: (text) => timeago(new Date(text)),
            sorter: (a, b) => a.name.length - b.name.length,
        }, {
            key: 'createdAt',
            title: 'created date',
            dataIndex: 'createdAt',
            width: 140,
            render: (text) => timeago(new Date(text)),
            sorter: (a, b) => a.name.length - b.name.length,
        }
    ], []);
    const tablePaginationConfig: TablePaginationConfig = {
        total,
        pageSize: size,
        defaultCurrent: 0,
        current: (offset / size) + 1,
        onChange: (page, _) => setFilterOptions({ offset: (page - 1) * size }),
        onShowSizeChange: (_, size) => setFilterOptions({ size, offset: 0 }),
        showQuickJumper: true,
        showSizeChanger: true,
    }

    return (
        <Table
            sticky
            loading={isLoading}
            columns={columns}
            dataSource={dataSource}
            pagination={tablePaginationConfig}
            bordered={false}
            showSorterTooltip={false}
            className='my-data-table'
            rowClassName='my-data-table-row'
            scroll={{ x: 1300 }}
        />
    )
}