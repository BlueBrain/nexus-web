import * as React from 'react'
import { Link, useLocation } from 'react-router-dom';
import { Fragment, useEffect, useMemo, useReducer, useRef } from 'react';
import { animate, spring } from 'motion';
import { Button, Table, Tag } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { FileDoneOutlined, DownloadOutlined, PlusOutlined, CloseOutlined, CloseSquareOutlined } from '@ant-design/icons'
import { makeOrgProjectTuple, TDataSource, TResourceTableData } from '../../molecules/MyDataTable/MyDataTable';
import useOnClickOutside from '../../../shared/hooks/useClickOutside';
import './styles.less';


type Props = {}
type TDataPanel = {
    resources: TResourceTableData;
    openDataPanel: boolean;
}
export class DataPanelEvent<T> extends Event {
    detail: T | undefined;
}
export const DATA_PANEL_STORAGE_EVENT = 'datapanelupdated';
export const DATA_PANEL_STORAGE = 'datapanel-storage';

function DataPanel({ }: Props) {
    const location = useLocation();
    const datapanelRef = useRef<HTMLDivElement>(null);
    const dataLS = localStorage.getItem(DATA_PANEL_STORAGE);
    const [{ openDataPanel, resources }, updateDataPanel] = useReducer(
        (previous: TDataPanel, newPartialState: Partial<TDataPanel>) => ({
            ...previous,
            ...newPartialState,
        }), {
        resources: JSON.parse(dataLS!),
        openDataPanel: false,
    })
    const handleRemoveItemFromDataPanel = (record: TDataSource) => {
        const selectedRowKeys = resources.selectedRowKeys.filter(t => t !== record.key);
        const selectedRows = resources.selectedRows.filter(t => t.key !== record.key);
        localStorage.setItem(DATA_PANEL_STORAGE, JSON.stringify({ selectedRowKeys, selectedRows }));
        window.dispatchEvent(new CustomEvent(DATA_PANEL_STORAGE_EVENT, {
            detail: {
                datapanel: { selectedRowKeys, selectedRows },
            }
        }));
        updateDataPanel({ resources: { selectedRowKeys, selectedRows } });
    }
    const totalSelectedResources = resources?.selectedRowKeys?.length;
    const handleOpenDataPanel = () => updateDataPanel({ openDataPanel: true });
    const handleCloseDataPanel = () => {
        updateDataPanel({ openDataPanel: false })
        datapanelRef.current && animate(datapanelRef.current, {
            height: '0px',
            opacity: 0,
            display: 'none',
        }, {
            duration: 1,
            easing: spring(),
        });
    }
    const handleClearSelectedItems = () => {
        updateDataPanel({
            resources: { selectedRowKeys: [], selectedRows: [] }
        });
        localStorage.removeItem(DATA_PANEL_STORAGE);
        window.dispatchEvent(new CustomEvent(DATA_PANEL_STORAGE_EVENT, {
            detail: {
                datapanel: { selectedRowKeys: [], selectedRows: [] },
            }
        }));
    }
    const columns: ColumnsType<TDataSource> = [
        {
            key: 'name',
            title: 'Name',
            dataIndex: 'name',
            fixed: true,
            width: '35%'
        }, {
            key: 'project',
            title: 'project',
            dataIndex: 'project',
            render: (text) => {
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
        }, {
            key: 'description',
            title: 'description',
            dataIndex: 'description',
        }, {
            key: 'type',
            title: 'type',
            dataIndex: 'type',
        }, {
            key: 'actions',
            title: 'actions',
            dataIndex: 'actions',
            render: (_, record) => {
                return (
                    <Button className='remove-data-item' onClick={() => handleRemoveItemFromDataPanel(record)}>
                        Remove
                        <CloseSquareOutlined />
                    </Button>
                )
            }
        }
    ];
    const dataSource: TDataSource[] = resources?.selectedRows || [];
    useEffect(() => {
        const dataPanelEventListner = (event: DataPanelEvent<{ datapanel: TResourceTableData }>) => {
            updateDataPanel({ resources: event.detail?.datapanel, openDataPanel: false })
        }
        window.addEventListener(DATA_PANEL_STORAGE_EVENT, dataPanelEventListner as EventListener);
        return () => {
            window.removeEventListener(DATA_PANEL_STORAGE_EVENT, dataPanelEventListner as EventListener);
        }
    }, []);
    useEffect(() => {
        if (openDataPanel && datapanelRef.current) {
            animate(datapanelRef.current, {
                height: '500px',
                display: 'flex',
                opacity: 1,
            }, {
                duration: 2,
                easing: spring(),
            });
        }
    }, [datapanelRef.current, openDataPanel]);
    useOnClickOutside(datapanelRef, () => {
        if (openDataPanel) {
            handleCloseDataPanel();
        }
    });
    if (
        !(dataSource.length &&
            (location.pathname === '/' ||
                location.pathname === '/search' ||
                location.pathname === '/my-data'
            ))
    )
        return null;
    return (
        <div className='datapanel'>
            <div ref={datapanelRef} className='datapanel-content' >
                <div className='datapanel-content-wrapper'>
                    <div className='header'>
                        <div className='title'>
                            <span>Your saved items</span>
                            <Button
                                type='link'
                                className='clear-data'
                                onClick={handleClearSelectedItems}
                            >
                                Clear all data
                            </Button>
                        </div>
                        <Button
                            onClick={handleCloseDataPanel}
                            type='link'
                            className='btn-icon-trigger'
                            icon={<CloseOutlined />}
                        />
                    </div>
                    <div className='items'>
                        <Table<TDataSource>
                            rowKey={(record) => `dp-${record.key}`}
                            columns={columns}
                            dataSource={dataSource}
                            bordered={false}
                            showSorterTooltip={false}
                            showHeader={false}
                            className='my-data-panel-table'
                            rowClassName='my-data-panel-table-row'
                            pagination={false}
                            scroll={{ y: 400 }}
                        />
                    </div>
                </div>
            </div>
            <div className='datapanel-bar'>
                <div className='left'>
                    <div className='selected-items'>
                        <FileDoneOutlined />
                        <span>{totalSelectedResources} elements selected</span>
                    </div>
                    <Button type='link'>
                        <DownloadOutlined />
                        Download
                    </Button>
                </div>
                <Button
                    type='link'
                    className='btn-icon-trigger'
                    icon={<PlusOutlined color='white' />}
                    onClick={handleOpenDataPanel}
                />
            </div>
        </div>
    )
}

export default DataPanel