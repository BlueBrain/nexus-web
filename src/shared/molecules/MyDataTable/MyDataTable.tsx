import React, { Fragment, useMemo, useReducer, useEffect } from 'react';
import { Button, Table, Tag, Tooltip, notification } from 'antd';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { PaginatedList } from '@bbp/nexus-sdk';
import {
  difference,
  differenceBy,
  union,
  has,
  isString,
  isArray,
} from 'lodash';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { SelectionSelectFn } from 'antd/lib/table/interface';
import {
  DataPanelEvent,
  DATA_PANEL_STORAGE,
  DATA_PANEL_STORAGE_EVENT,
} from '../../organisms/DataPanel/DataPanel';
import { TFilterOptions } from '../MyDataHeader/MyDataHeader';
import timeago from '../../../utils/timeago';
import isValidUrl from '../../../utils/validUrl';
import './styles.less';
export const MAX_DATA_SELECTED_ALLOWED_SIZE = 1073741824;
export const MAX_LOCAL_STORAGE_ALLOWED_SIZE = 4.5;
type TResource = {
  [key: string]: any;
} & {
  '@context'?:
    | string
    | (
        | string
        | {
            [key: string]: any;
          }
      )[]
    | {
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
};
export type TResourceTableData = {
  selectedRowKeys: React.Key[];
  selectedRows: TDataSource[];
};
export type TDataSource = {
  source?: string;
  key: React.Key;
  _self: string;
  id: string;
  name: string;
  project: string;
  description: string;
  type?: string | string[];
  updatedAt: string;
  createdAt: string;
  resource?: TResource;
  distribution?: {
    contentSize: number;
    encodingFormat: string | string[];
    label: string | string[];
  };
};
type TProps = {
  setFilterOptions: React.Dispatch<Partial<TFilterOptions>>;
  isLoading: boolean;
  resources: PaginatedList<TResource> | undefined;
  offset: number;
  size: number;
  total?: number;
};
export const makeOrgProjectTuple = (text: string) => {
  const parts = text.split('/');
  const [org, project] = parts.slice(-2);
  return {
    org,
    project,
  };
};

const makeResourceUri = (
  orgLabel: string,
  projectLabel: string,
  resourceId: string
) => {
  return `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
    resourceId
  )}`;
};
export const getLocalStorageSize = () => {
  let size = 0;
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key!);
    size = size + (key!.length + value!.length) * 2; // UTF-16
  }
  size = size / 1048576;
  return size;
};
export const notifyTotalSizeExeeced = () => {
  return notification.warning({
    message: (
      <div>
        The selected items has exceed the maximum size allowed or <br /> local
        storage size will reduce the performance of your app
      </div>
    ),
    description: <em>Maximum size must be lower or equal than 1GB</em>,
    key: 'data-panel-size-exceeded',
  });
};
const MyDataTable: React.FC<TProps> = ({
  setFilterOptions,
  isLoading,
  resources,
  size,
  offset,
  total,
}) => {
  const history = useHistory();
  const location = useLocation();
  const [{ selectedRowKeys }, updateTableData] = useReducer(
    (
      previous: TResourceTableData,
      partialData: Partial<TResourceTableData>
    ) => ({
      ...previous,
      ...partialData,
    }),
    {
      selectedRowKeys: [],
      selectedRows: [],
    }
  );
  const goToResource = (
    orgLabel: string,
    projectLabel: string,
    resourceId: string
  ) => {
    history.push(makeResourceUri(orgLabel, projectLabel, resourceId), {
      background: location,
    });
  };
  const columns: ColumnsType<TDataSource> = useMemo(
    () => [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        fixed: true,
        width: 250,
        ellipsis: true,
        render: (text, record) => {
          const showedText = isValidUrl(text) ? text.split('/').pop() : text;
          if (text && record.resource?._project) {
            const { org, project } = makeOrgProjectTuple(
              record.resource._project
            );
            return (
              <Tooltip title={text}>
                <Button
                  style={{ padding: 0 }}
                  type="link"
                  onClick={() => goToResource(org, project, text)}
                >
                  {showedText}
                </Button>
              </Tooltip>
            );
          }
          return <Tooltip title={text}>{showedText}</Tooltip>;
        },
      },
      {
        key: 'project',
        title: 'project',
        dataIndex: 'project',
        sorter: false,
        render: (text, record) => {
          if (text) {
            const { org, project } = makeOrgProjectTuple(text);
            return (
              <Fragment>
                <Tag className="org-project-tag" color="white">
                  {org}
                </Tag>
                <Link to={`/orgs/${org}/${project}`}>{project}</Link>
              </Fragment>
            );
          }
          return '';
        },
      },
      {
        key: 'description',
        title: 'description',
        dataIndex: 'description',
        ellipsis: true,
        sorter: false,
      },
      {
        key: 'type',
        title: 'type',
        dataIndex: 'type',
        sorter: false,
        render: text => {
          let types = '';
          if (isArray(text)) {
            types = text
              .map(item => (isValidUrl(item) ? item.split('/').pop() : item))
              .join('\n');
          } else if (isString(text) && isValidUrl(text)) {
            types = text.split('/').pop() ?? '';
          } else {
            types = text;
          }
          return (
            <Tooltip
              title={() => <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>}
            >
              <div style={{ whiteSpace: 'pre-wrap' }}>{types}</div>
            </Tooltip>
          );
        },
      },
      {
        key: 'updatedAt',
        title: 'updated date',
        dataIndex: 'updatedAt',
        width: 140,
        sorter: false,
        render: text => timeago(new Date(text)),
      },
      {
        key: 'createdAt',
        title: 'created date',
        dataIndex: 'createdAt',
        width: 140,
        sorter: false,
        render: text => timeago(new Date(text)),
      },
    ],
    []
  );
  const dataSource: TDataSource[] =
    resources?._results.map(resource => {
      return {
        resource,
        key: resource._self,
        _self: resource._self,
        id: resource['@id'],
        name: resource['@id'] ?? resource._self,
        project: resource._project,
        description: '',
        type: resource['@type'],
        createdAt: resource._createdAt,
        updatedAt: resource._updatedAt,
        distribution: has(resource, 'distribution')
          ? {
              contentSize: resource.distribution?.contentSize ?? 0,
              encodingFormat: resource.distribution?.encodingFormat ?? '',
              label: resource.distribution?.label ?? '',
              hasDistribution: has(resource, 'distribution'),
            }
          : resource['@type'] === 'File'
          ? {
              contentSize: resource._bytes,
              encodingFormat: resource._mediaType,
              label: resource._filename,
            }
          : {
              contentSize: 0,
              encodingFormat: '',
              label: '',
            },
        source: 'my-data',
      };
    }) || [];
  const allowedTotal = total ? (total > 10000 ? 10000 : total) : undefined;
  const tablePaginationConfig: TablePaginationConfig = {
    total: allowedTotal,
    pageSize: size,
    defaultCurrent: 0,
    current: offset / size + 1,
    onChange: (page, _) => setFilterOptions({ offset: (page - 1) * size }),
    onShowSizeChange: (_, size) => setFilterOptions({ size, offset: 0 }),
    showQuickJumper: true,
    showSizeChanger: true,
  };
  const onSelectRowChange: SelectionSelectFn<TDataSource> = (
    record,
    selected
  ) => {
    const dataPanelLS: TResourceTableData = JSON.parse(
      localStorage.getItem(DATA_PANEL_STORAGE)!
    );
    let selectedRowKeys = dataPanelLS?.selectedRowKeys || [];
    let selectedRows = dataPanelLS?.selectedRows || [];
    if (selected) {
      selectedRowKeys = [...selectedRowKeys, record._self];
      selectedRows = [...selectedRows, { ...record, source: 'my-data' }];
    } else {
      selectedRowKeys = selectedRowKeys.filter(t => t !== record._self);
      selectedRows = selectedRows.filter(t => t.key !== record._self);
    }
    const size = selectedRows.reduce(
      (acc, item) => acc + (item.distribution?.contentSize || 0),
      0
    );
    if (
      size > MAX_DATA_SELECTED_ALLOWED_SIZE ||
      getLocalStorageSize() > MAX_LOCAL_STORAGE_ALLOWED_SIZE
    ) {
      return notifyTotalSizeExeeced();
    }
    localStorage.setItem(
      DATA_PANEL_STORAGE,
      JSON.stringify({
        selectedRowKeys,
        selectedRows,
      })
    );
    window.dispatchEvent(
      new CustomEvent(DATA_PANEL_STORAGE_EVENT, {
        detail: {
          datapanel: { selectedRowKeys, selectedRows },
        },
      })
    );
  };

  const onSelectAllChange = (
    selected: boolean,
    tSelectedRows: TDataSource[],
    changeRows: TDataSource[]
  ) => {
    const dataPanelLS: TResourceTableData = JSON.parse(
      localStorage.getItem(DATA_PANEL_STORAGE)!
    );
    let selectedRowKeys = dataPanelLS?.selectedRowKeys || [];
    let selectedRows = dataPanelLS?.selectedRows || [];
    if (selected) {
      selectedRows = union(
        selectedRows,
        changeRows.map(t => ({ ...t, source: 'my-data' }))
      );
      selectedRowKeys = union(
        selectedRowKeys,
        changeRows.map(t => t.key)
      );
    } else {
      selectedRows = differenceBy(selectedRows, changeRows, 'key');
      selectedRowKeys = difference(
        selectedRowKeys,
        changeRows.map(t => t._self)
      );
    }
    const size = selectedRows.reduce(
      (acc, item) => acc + (item.distribution?.contentSize || 0),
      0
    );
    if (
      size > MAX_DATA_SELECTED_ALLOWED_SIZE ||
      getLocalStorageSize() > MAX_LOCAL_STORAGE_ALLOWED_SIZE
    ) {
      return notifyTotalSizeExeeced();
    }
    localStorage.setItem(
      DATA_PANEL_STORAGE,
      JSON.stringify({
        selectedRowKeys,
        selectedRows,
      })
    );
    window.dispatchEvent(
      new CustomEvent(DATA_PANEL_STORAGE_EVENT, {
        detail: {
          datapanel: { selectedRowKeys, selectedRows },
        },
      })
    );
  };

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
    const dataPanelEventListner = (
      event: DataPanelEvent<{ datapanel: TResourceTableData }>
    ) => {
      updateTableData({
        selectedRows: event.detail?.datapanel.selectedRows,
        selectedRowKeys: event.detail?.datapanel.selectedRowKeys,
      });
    };
    window.addEventListener(
      DATA_PANEL_STORAGE_EVENT,
      dataPanelEventListner as EventListener
    );
    return () => {
      window.removeEventListener(
        DATA_PANEL_STORAGE_EVENT,
        dataPanelEventListner as EventListener
      );
    };
  }, []);
  return (
    <Table<TDataSource>
      sticky={{
        offsetHeader: 50,
        getContainer: () => window,
      }}
      rowKey={record => record.key}
      loading={isLoading}
      columns={columns}
      dataSource={dataSource}
      pagination={tablePaginationConfig}
      bordered={false}
      showSorterTooltip={false}
      className="my-data-table"
      rowClassName="my-data-table-row"
      scroll={{ x: 1300 }}
      rowSelection={{
        selectedRowKeys,
        onSelect: onSelectRowChange,
        onSelectAll: onSelectAllChange,
      }}
    />
  );
};

export default MyDataTable;
