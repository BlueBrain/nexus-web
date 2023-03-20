import React from 'react';
import { Table, Input, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import './SettingsView.less';

type Props = {}
type DataType = {
    key: string;
    location: string;
    type: string;
    default: string;
    endpoint: string;
    max_file_size: string;
    read: string;
    write: string;
    deprecated: string;
}

const viewsSample: DataType[] = [{
    key: 'opt/binaries',
    location: 'opt/binaries',
    type: 'DiskStorageDefault',
    default: 'False',
    endpoint: '-',
    max_file_size: '10 GB',
    read: 'resources/read',
    write: 'files/write',
    deprecated: 'files/write',
}, {
    key: 'prj109',
    location: 'prj109',
    type: 'RemoteStorageDefault',
    default: 'True',
    endpoint: 'http//storage.s3.com/prj109',
    max_file_size: '33 GB',
    read: 'gpfs-prj109/read',
    write: 'gpfs-prj109/write',
    deprecated: 'files/write',
}];


const StoragesSubView = (props: Props) => {
    const handleOnEdit = () => {}
    const createNewStorageHandler = () => {}
    const columns: ColumnsType<DataType> = [{
        key: 'location',
        dataIndex: 'location',
        title: 'Location',
        render: (text) => <span>{text}</span>

    }, {
        key: 'type',
        dataIndex: 'type',
        title: 'Type',
        render: (text) => <span>{text}</span>
    }, {
        key: 'default',
        dataIndex: 'default',
        title: 'Default',
        align: 'center',
        render: (text) => <span>{text}</span>
    }, {
        key: 'endpoint',
        dataIndex: 'endpoint',
        title: 'Endpoint',
        align: 'center',
        render: (text) => <span>{text}</span>
    }, {
        key: 'max_file_size',
        dataIndex: 'max_file_size',
        title: 'Maximum File Size',
        align: 'center',
        render: (text) => <span>{text}</span>
    }, {
        key: 'read',
        dataIndex: 'read',
        title: 'Read',
        align: 'center',
        render: (text) => <span>{text}</span>
    }, {
        key: 'write',
        dataIndex: 'write',
        title: 'Write',
        align: 'center',
        render: (text) => <span>{text}</span>
    }, {
        key: 'deprecated',
        dataIndex: 'deprecated',
        title: 'Deprecated',
        align: 'center',
        render: (text) => <span>{text}</span>
    }, {
        key: 'actions',
        dataIndex: 'actions',
        title: 'Actions',
        align: 'center',
        render: (text) => <Button type='link' htmlType='button' onClick={handleOnEdit}>Edit</Button>
    }];

    const data: DataType[] = viewsSample;

    return (
        <div className='settings-view settings-storages-view'>
            <h2>Storages</h2>
            <div className='settings-view-container'>
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
                    className='views-table'
                    rowClassName='view-item-row'
                    columns={columns}
                    dataSource={data}
                    sticky={true}
                    size='small'
                />
            </div>
        </div>
    )
}

export default StoragesSubView;