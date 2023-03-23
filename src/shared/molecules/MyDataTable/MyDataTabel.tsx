import React, { useMemo } from 'react';
import { Table } from 'antd';
import './MyDataTable.less';
import { ColumnsType } from 'antd/lib/table';


type Props = {}
type TDataSource = {
    key: string;
    name: string;
    project: string;
    description: string;
    type: string;
    updatedAt: string;
    createdAt: string;
}
const data: TDataSource[] = [{
    key: "1",
    name: "Lorem ipsum dolor sit amet consectetur",
    project: "Lorem ipsum dolor sit amet consectetur",
    description: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Optio, dolorem quam perferendis veritatis blanditiis earum similique ipsam commodi provident ipsum nulla, illo obcaecati reiciendis animi dolores, eveniet architecto. Blanditiis, reprehenderit!",
    type: "Lorem ipsum dolor sit amet consectetur",
    updatedAt: "Lorem ipsum dolor sit amet consectetur",
    createdAt: "Lorem ipsum dolor sit amet consectetur",
}, {
    key: "1",
    name: "Lorem ipsum dolor sit amet consectetur",
    project: "Lorem ipsum dolor sit amet consectetur",
    description: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Optio, dolorem quam perferendis veritatis blanditiis earum similique ipsam commodi provident ipsum nulla, illo obcaecati reiciendis animi dolores, eveniet architecto. Blanditiis, reprehenderit!",
    type: "Lorem ipsum dolor sit amet consectetur",
    updatedAt: "Lorem ipsum dolor sit amet consectetur",
    createdAt: "Lorem ipsum dolor sit amet consectetur",
}, {
    key: "1",
    name: "Lorem ipsum dolor sit amet consectetur",
    project: "Lorem ipsum dolor sit amet consectetur",
    description: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Optio, dolorem quam perferendis veritatis blanditiis earum similique ipsam commodi provident ipsum nulla, illo obcaecati reiciendis animi dolores, eveniet architecto. Blanditiis, reprehenderit!",
    type: "Lorem ipsum dolor sit amet consectetur",
    updatedAt: "Lorem ipsum dolor sit amet consectetur",
    createdAt: "Lorem ipsum dolor sit amet consectetur",
}, {
    key: "1",
    name: "Lorem ipsum dolor sit amet consectetur",
    project: "Lorem ipsum dolor sit amet consectetur",
    description: "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Optio, dolorem quam perferendis veritatis blanditiis earum similique ipsam commodi provident ipsum nulla, illo obcaecati reiciendis animi dolores, eveniet architecto. Blanditiis, reprehenderit!",
    type: "Lorem ipsum dolor sit amet consectetur",
    updatedAt: "Lorem ipsum dolor sit amet consectetur",
    createdAt: "Lorem ipsum dolor sit amet consectetur",
}]
export default function MyDataTabel({ }: Props) {
    const columns: ColumnsType<TDataSource> = useMemo(() => [
        {
            key: 'name',
            title: 'Name',
            dataIndex: 'name',
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
            sorter: (a, b) => a.name.length - b.name.length,
        }, {
            key: 'createdAt',
            title: 'created date',
            dataIndex: 'createdAt',
            sorter: (a, b) => a.name.length - b.name.length,
        }
    ], []);
    // const data: TDataSource[] = []
    return (
        <Table
            columns={columns}
            dataSource={data}
            bordered={false}
            showSorterTooltip={false}
            className='my-data-table'
            rowClassName='my-data-table-row'
        />
    )
}