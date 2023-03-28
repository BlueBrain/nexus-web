import React, { Fragment, useMemo } from 'react';
import { Table, Tag } from 'antd';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { TFilterOptions } from '../MyDataHeader/MyDataHeader';
import timeago from '../../../utils/timeago';
import './styles.less';
import { Link } from 'react-router-dom';


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
const makeOrgProjectTuple = (text: string) => {
    const parts = text.split('/');
    const [org, project] = parts.slice(-2);
    return {
        org, project
    }
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
            render: (text, record) => {
                console.log('text project', text, record)
                if(text){
                    const { org, project } = makeOrgProjectTuple(text);
                    return (
                        <Fragment>
                            <Tag className='org-project-tag' color='white'>{org}</Tag>
                            <Link to={`/orgs/${org}/${project}`}>
                                {project}
                            </Link>
                        </Fragment>
                    )
                }
                return "";
            },
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