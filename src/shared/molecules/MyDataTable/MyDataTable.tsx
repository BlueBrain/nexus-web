import React, { Fragment, useMemo, useReducer, useEffect } from 'react';
import { Table, Tag } from 'antd';
import { Link, useHistory } from 'react-router-dom';
import { PaginatedList } from '@bbp/nexus-sdk';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { SelectionSelectFn } from 'antd/lib/table/interface';
import { difference, differenceBy, union } from 'lodash';
import { DataPanelEvent, DATA_PANEL_STORAGE, DATA_PANEL_STORAGE_EVENT } from '../../organisms/DataPanel/DataPanel';
import { TFilterOptions } from '../MyDataHeader/MyDataHeader';
import timeago from '../../../utils/timeago';
import './styles.less';

type TResource = {
    [key: string]: any;
} & {
    '@context'?: string | (string | {
        [key: string]: any;
    })[] | {
        [key: string]: any;
    };
    '@type'?: string | string[];
    '@id': string;
    _incoming: string;
    _outgoing: string;
    _self: string;
    _constrainedBy: string;
    _project: string;
    _rev: number;
    _deprecated: boolean;
    _createdAt: string;
    _createdBy: string;
    _updatedAt: string;
    _updatedBy: string;
}
export type TDataSource = {
    key: React.Key;
    name: string;
    project: string;
    description: string;
    type?: string | string[];
    updatedAt: string;
    createdAt: string;
    resource: TResource;
}
type Props = {
    setFilterOptions: React.Dispatch<Partial<TFilterOptions>>,
    isLoading: boolean;
    resources: PaginatedList<TResource> | undefined;
    offset: number;
    size: number;
    total?: number;
}
export const makeOrgProjectTuple = (text: string) => {
    const parts = text.split('/');
    const [org, project] = parts.slice(-2);
    return {
        org, project
    }
}
export type TResourceTableData = {
    selectedRowKeys: React.Key[];
    selectedRows: TDataSource[];
}
const makeResourceUri = (
    orgLabel: string,
    projectLabel: string,
    resourceId: string
) => {
    return `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
        resourceId
    )}`;
};
export default function MyDataTabel({
    setFilterOptions,
    isLoading,
    resources,
    size,
    offset,
    total,
}: Props) {
    const history = useHistory();
    const [{ selectedRowKeys }, updateTableData] = useReducer(
        (previous: TResourceTableData, partialData: Partial<TResourceTableData>) => ({
            ...previous,
            ...partialData,
        }), {
        selectedRowKeys: [],
        selectedRows: [],
    });
    const goToResource = (
        orgLabel: string,
        projectLabel: string,
        resourceId: string
    ) => {
        history.push(makeResourceUri(orgLabel, projectLabel, resourceId), {
            background: location,
        });
    };
    const columns: ColumnsType<TDataSource> = useMemo(() => [
        {
            key: 'name',
            title: 'Name',
            dataIndex: 'name',
            fixed: true,
            sorter: (a, b) => a.name.length - b.name.length,
            render: (text, record) => {
                if (text && record.resource._project) {
                    const { org, project } = makeOrgProjectTuple(record.resource._project);
                    const uri = makeResourceUri(org, project, text);
                    return (
                        <Fragment>
                            <Link to={uri}>
                                {text}
                            </Link>
                        </Fragment>
                    )
                }
                return text;
            }
        }, {
            key: 'project',
            title: 'project',
            dataIndex: 'project',
            render: (text, record) => {
                if (text) {
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
    const dataSource: TDataSource[] = resources?._results.map(resource => {
        return ({
            key: resource._self,
            name: resource['@id'],
            project: resource._project,
            description: "",
            type: resource['@type'],
            createdAt: resource._createdAt,
            updatedAt: resource._updatedAt,
            resource: resource,
        })
    }) || [];
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
    const onSelectRowChange: SelectionSelectFn<TDataSource> = (record, selected) => {
        console.log('@@record', { record, selected })
        const dataPanelLS: TResourceTableData = JSON.parse(localStorage.getItem(DATA_PANEL_STORAGE)!);
        let selectedRowKeys = dataPanelLS?.selectedRowKeys || [];
        let selectedRows = dataPanelLS?.selectedRows || [];
        if (selected) {
            selectedRowKeys = [...selectedRowKeys, record.key];
            selectedRows = [...selectedRows, record];
        } else {
            selectedRowKeys = selectedRowKeys.filter(t => t !== record.key);
            selectedRows = selectedRows.filter(t => t.key !== record.key);
        }
        localStorage.setItem(DATA_PANEL_STORAGE, JSON.stringify({
            selectedRowKeys,
            selectedRows,
        }));
        window.dispatchEvent(new CustomEvent(DATA_PANEL_STORAGE_EVENT, {
            detail: {
                datapanel: { selectedRowKeys, selectedRows, }
            }
        }));
    }
    
    const onSelectAllChange = (selected: boolean, tSelectedRows: TDataSource[], changeRows: TDataSource[]) => {
        const dataPanelLS: TResourceTableData = JSON.parse(localStorage.getItem(DATA_PANEL_STORAGE)!);
        let selectedRowKeys = dataPanelLS?.selectedRowKeys || [];
        let selectedRows = dataPanelLS?.selectedRows || [];
        if(selected) {
            selectedRows = union(selectedRows, changeRows);
            selectedRowKeys = union(selectedRowKeys, changeRows.map(t => t.key));
        } else {
            selectedRows = differenceBy(selectedRows, changeRows, 'key');
            selectedRowKeys = difference(selectedRowKeys, changeRows.map(t => t.key));
        }
        localStorage.setItem(DATA_PANEL_STORAGE, JSON.stringify({
            selectedRowKeys,
            selectedRows,
        }));
        window.dispatchEvent(new CustomEvent(DATA_PANEL_STORAGE_EVENT, {
            detail: {
                datapanel: { selectedRowKeys, selectedRows }
            }
        }));
    }

    useEffect(() => {
        const dataLs = localStorage.getItem(DATA_PANEL_STORAGE);
        const dataLsObject: TResourceTableData = JSON.parse(dataLs as string);
        if (dataLs && dataLs.length) {
            updateTableData({
                selectedRows: dataLsObject.selectedRows,
                selectedRowKeys: dataLsObject.selectedRowKeys,
            });
        }
    }, []);
    useEffect(() => {
        const dataPanelEventListner = (event: DataPanelEvent<{ datapanel: TResourceTableData }>) => {
            updateTableData({
                selectedRows: event.detail?.datapanel.selectedRows,
                selectedRowKeys: event.detail?.datapanel.selectedRowKeys,
            })
        }
        window.addEventListener(DATA_PANEL_STORAGE_EVENT, dataPanelEventListner as EventListener);
        return () => {
            window.removeEventListener(DATA_PANEL_STORAGE_EVENT, dataPanelEventListner as EventListener);
        }
    }, []);
    return (
        <Table<TDataSource>
            sticky
            rowKey={(record) => record.key}
            loading={isLoading}
            columns={columns}
            dataSource={dataSource}
            pagination={tablePaginationConfig}
            bordered={false}
            showSorterTooltip={false}
            className='my-data-table'
            rowClassName='my-data-table-row'
            scroll={{ x: 1300 }}
            rowSelection={{
                selectedRowKeys,
                onSelect: onSelectRowChange,
                onSelectAll: onSelectAllChange,
            }}

        />
    )
}