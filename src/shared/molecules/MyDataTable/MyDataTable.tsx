import React, {
  Fragment,
  useMemo,
  useReducer,
  useEffect,
  useState,
  CSSProperties,
} from 'react';
import { Button, Empty, Table, Tag, Tooltip, notification } from 'antd';
import {
  CaretDownOutlined,
  CaretUpOutlined,
  VerticalAlignMiddleOutlined,
} from '@ant-design/icons';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { PaginatedList, Resource } from '@bbp/nexus-sdk/es';
import { isString, isArray, isNil } from 'lodash';
import { clsx } from 'clsx';
import { useSelector } from 'react-redux';
import { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { SelectionSelectFn } from 'antd/lib/table/interface';
import {
  DataPanelEvent,
  DATA_PANEL_STORAGE,
  DATA_PANEL_STORAGE_EVENT,
} from '../../organisms/DataPanel/DataPanel';
import { RootState } from '../../../shared/store/reducers';
import { TFilterOptions } from '../../../shared/canvas/MyData/types';
import timeago from '../../../utils/timeago';
import isValidUrl from '../../../utils/validUrl';
import './styles.scss';
import {
  removeLocalStorageRows,
  toLocalStorageResources,
} from '../../../shared/utils/datapanel';
import { getResourceLabel } from '../../../shared/utils';
import { useNexusContext } from '@bbp/react-nexus';
import { fetchResourceForDownload } from '../../../shared/hooks/useAccessDataForTable';
import PromisePool from '@supercharge/promise-pool';

export const MAX_DATA_SELECTED_SIZE__IN_BYTES = 1_073_741_824;
export const MAX_LOCAL_STORAGE_ALLOWED_SIZE = 4.5;

interface TMyDataTableRow extends Resource {
  name: string;
  description: string;
}
export type TResourceTableData = {
  selectedRowKeys: React.Key[];
  selectedRows: TDataSource[];
};

export type Distribution = {
  contentSize: number;
  encodingFormat: string | string[];
  label: string | string[];
  hasDistribution: boolean;
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
  resource?: any; // TODO: Remove
  localStorageType?: 'resource' | 'distribution';
  distributionItemsLength?: number;
  distribution: {
    contentSize: number;
    encodingFormat: string | string[];
    label: string;
    hasDistribution: boolean;
  };
};
type TProps = {
  setFilterOptions: React.Dispatch<Partial<TFilterOptions>>;
  isLoading: boolean;
  resources: PaginatedList<Resource> | undefined;
  offset: number;
  size: number;
  total?: number;
  sort: string[];
  updateSort(value: string[]): void;
  locate: boolean;
  query: string;
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
    description: <em>Maximum size must be lower than or equal to 1GB</em>,
    key: 'data-panel-size-exceeded',
  });
};
export const getTypesTrancated = (text?: string | string[]) => {
  let types = '';
  let typesWithUrl = text;
  if (!text) {
    return { types: '' };
  }
  if (isArray(text)) {
    types = text
      .map(item => (isValidUrl(item) ? item.split('/').pop() : item))
      .join('\n');
    typesWithUrl = text.join('\n');
  } else if (isString(text) && isValidUrl(text)) {
    types = text.split('/').pop()!;
  } else {
    types = text;
  }
  return {
    types,
    typesWithUrl,
  };
};
type TSorterProps = {
  order?: string;
  name: string;
  onSortDescend(): void;
  onSortAscend(): void;
};
const columnWhiteSpaceWrap = { whiteSpace: 'nowrap' } as CSSProperties;
const Sorter = ({ onSortDescend, onSortAscend, order, name }: TSorterProps) => {
  if (!order) {
    return (
      <VerticalAlignMiddleOutlined
        style={{ marginLeft: 5, fontSize: 13 }}
        onClick={onSortDescend}
      />
    );
  }
  return order === 'asc' ? (
    <CaretDownOutlined
      style={{ marginLeft: 5, fontSize: 13 }}
      name={`${name}-desc`}
      onClick={onSortDescend}
    />
  ) : (
    <CaretUpOutlined
      style={{ marginLeft: 5, fontSize: 13 }}
      name={`${name}-asc`}
      onClick={onSortAscend}
    />
  );
};

const MyDataTable: React.FC<TProps> = ({
  setFilterOptions,
  isLoading,
  resources,
  size,
  offset,
  total,
  sort,
  updateSort,
  locate,
  query,
}) => {
  const history = useHistory();
  const location = useLocation();
  const { currentResourceView } = useSelector(
    (state: RootState) => state.uiSettings
  );
  const nexus = useNexusContext();
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

  const [fetchingResourcesForDownload, setFetchingResources] = useState(false);

  const goToResource = (
    orgLabel: string,
    projectLabel: string,
    resourceId: string
  ) => {
    history.push(makeResourceUri(orgLabel, projectLabel, resourceId), {
      background: location,
    });
  };
  const columns: ColumnsType<TMyDataTableRow> = useMemo(
    () => [
      {
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        fixed: true,
        width: 250,
        ellipsis: true,
        render: (text, record) => {
          const resourceId = record['@id'] ?? record._self;
          if (text && record._project) {
            const { org, project } = makeOrgProjectTuple(record._project);
            return (
              <Tooltip title={resourceId}>
                <Button
                  style={{ padding: 0, ...columnWhiteSpaceWrap }}
                  type="link"
                  onClick={() => goToResource(org, project, resourceId)}
                >
                  {text}
                </Button>
              </Tooltip>
            );
          }
          return <Tooltip title={resourceId}>{text}</Tooltip>;
        },
      },
      {
        key: 'project',
        dataIndex: '_project',
        title: () => {
          const order = sort.find(item => item.includes('_project'));
          const orderDirection = order
            ? order.includes('-')
              ? 'desc'
              : 'asc'
            : undefined;
          return (
            <div style={columnWhiteSpaceWrap}>
              organization / project
              {(!query || query.trim() === '') && (
                <Sorter
                  name="name"
                  order={orderDirection}
                  onSortAscend={() => updateSort(['_project'])}
                  onSortDescend={() => updateSort(['-_project'])}
                />
              )}
            </div>
          );
        },
        render: text => {
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
        dataIndex: '@type',
        sorter: false,
        render: text => {
          const { types, typesWithUrl } = getTypesTrancated(text);
          return (
            <Tooltip
              title={() => (
                <div style={{ whiteSpace: 'pre-wrap' }}>{typesWithUrl}</div>
              )}
            >
              <div style={{ whiteSpace: 'pre-wrap' }}>{types}</div>
            </Tooltip>
          );
        },
      },
      {
        key: 'updatedAt',
        dataIndex: '_updatedAt',
        width: 140,
        sorter: false,
        title: () => {
          const order = sort.find(item => item.includes('_updatedAt'));
          const orderDirection = order
            ? order.includes('-')
              ? 'desc'
              : 'asc'
            : undefined;
          return (
            <div style={columnWhiteSpaceWrap}>
              updated date
              {(!query || query.trim() === '') && (
                <Sorter
                  name="name"
                  order={orderDirection}
                  onSortAscend={() => updateSort(['_updatedAt', '@id'])}
                  onSortDescend={() => updateSort(['-_updatedAt', '@id'])}
                />
              )}
            </div>
          );
        },
        render: text => timeago(new Date(text)),
      },
      {
        key: 'createdAt',
        dataIndex: '_createdAt',
        width: 140,
        sorter: false,
        title: () => {
          const order = sort.find(item => item.includes('_createdAt'));
          const orderDirection = order
            ? order.includes('-')
              ? 'desc'
              : 'asc'
            : undefined;
          return (
            <div style={columnWhiteSpaceWrap}>
              created date
              {(!query || query.trim() === '') && (
                <Sorter
                  name="name"
                  order={orderDirection}
                  onSortAscend={() => updateSort(['_createdAt', '@id'])}
                  onSortDescend={() => updateSort(['-_createdAt', '@id'])}
                />
              )}
            </div>
          );
        },
        render: text => timeago(new Date(text)),
      },
    ],
    [sort, query]
  );
  const dataSource: TMyDataTableRow[] =
    resources?._results?.map(resource => {
      return {
        ...resource,
        name: getResourceLabel(resource),
        description: resource.discription ?? '',
      };
    }) || [];
  const allowedTotal = total ? (total > 10000 ? 10000 : total) : undefined;
  const tablePaginationConfig: TablePaginationConfig = {
    total: allowedTotal,
    pageSize: size,
    defaultPageSize: size,
    defaultCurrent: 0,
    current: offset / size + 1,
    onChange: (page, _) => setFilterOptions({ offset: (page - 1) * size }),
    onShowSizeChange: (_, size) => setFilterOptions({ size, offset: 0 }),
    showQuickJumper: true,
    showSizeChanger: true,
  };
  const onSelectRowChange: SelectionSelectFn<TMyDataTableRow> = async (
    record,
    selected
  ) => {
    const recordKey = record._self;
    const dataPanelLS: TResourceTableData = JSON.parse(
      localStorage.getItem(DATA_PANEL_STORAGE)!
    );

    let localStorageRows;
    if (selected && isNil(record.distribution)) {
      // Sometimes the distributions are not available in the response of the bulk fetch of resources. Delta is working on fixing this.
      // In the mean time, fusion can retrieve this extra information by doing a separate request per resource that does not have `distribution`.
      setFetchingResources(true);
      const expandedResource = await fetchResourceForDownload(recordKey, nexus);
      setFetchingResources(false);
      localStorageRows = toLocalStorageResources(expandedResource, 'my-data');
    } else {
      localStorageRows = toLocalStorageResources(record, 'my-data');
    }
    toLocalStorageResources(record, 'my-data');
    let selectedRowKeys = dataPanelLS?.selectedRowKeys || [];
    let selectedRows = dataPanelLS?.selectedRows || [];

    if (selected) {
      selectedRowKeys = [...selectedRowKeys, recordKey];
      selectedRows = [...selectedRows, ...localStorageRows];
    } else {
      selectedRowKeys = selectedRowKeys.filter(t => t !== recordKey);
      selectedRows = removeLocalStorageRows(selectedRows, [recordKey]);
    }

    const size = selectedRows.reduce(
      (acc, item) => acc + (item.distribution?.contentSize || 0),
      0
    );
    if (
      size > MAX_DATA_SELECTED_SIZE__IN_BYTES ||
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

  const onSelectAllChange = async (
    selected: boolean,
    _: TMyDataTableRow[],
    changeRows: TMyDataTableRow[]
  ) => {
    const dataPanelLS: TResourceTableData = JSON.parse(
      localStorage.getItem(DATA_PANEL_STORAGE)!
    );
    let selectedRowKeys = dataPanelLS?.selectedRowKeys || [];
    let selectedRows = dataPanelLS?.selectedRows || [];

    if (selected) {
      setFetchingResources(true);

      const { results } = await PromisePool.withConcurrency(4)
        .for(changeRows)
        .handleError(async err => {
          console.log(
            '@@error in selecting multiple resources for download in my-data',
            err
          );
          return;
        })
        .process(async row => {
          let localStorageResources: TDataSource[];
          // Sometimes the distributions are not available in the response of the bulk fetch of resources. Delta is working on fixing this.
          // In the mean time, fusion can retrieve this extra information by doing a separate request per resource that does not have `distribution`.

          if (isNil(row.distribution)) {
            const fetchedRow = await fetchResourceForDownload(row._self, nexus);
            localStorageResources = toLocalStorageResources(
              fetchedRow,
              'my-data'
            );
          } else {
            localStorageResources = toLocalStorageResources(row, 'my-data');
          }
          return localStorageResources;
        });

      selectedRows = [...selectedRows, ...results.flat()];
      selectedRowKeys = [...selectedRowKeys, ...changeRows.map(t => t._self)];

      setFetchingResources(false);
    } else {
      const rowKeysToRemove = changeRows.map(r => r._self);

      selectedRowKeys = selectedRowKeys.filter(
        key => !rowKeysToRemove.includes(key.toString())
      );
      selectedRows = removeLocalStorageRows(selectedRows, rowKeysToRemove);
    }
    const size = selectedRows.reduce(
      (acc, item) => acc + (item.distribution?.contentSize || 0),
      0
    );
    if (
      size > MAX_DATA_SELECTED_SIZE__IN_BYTES ||
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
    <Table<TMyDataTableRow>
      sticky={{
        offsetHeader: 50,
        getContainer: () => window,
      }}
      rowKey={record => record._self}
      loading={isLoading || fetchingResourcesForDownload}
      columns={columns}
      dataSource={dataSource}
      pagination={tablePaginationConfig}
      bordered={false}
      showSorterTooltip={false}
      className="my-data-table"
      rowClassName={record =>
        clsx(
          `my-data-table-row`,
          record._self === currentResourceView?._self &&
          'ant-table-row-selected'
        )
      }
      scroll={{ x: 1300 }}
      rowSelection={{
        selectedRowKeys,
        onSelect: onSelectRowChange,
        onSelectAll: onSelectAllChange,
      }}
      locale={{
        emptyText() {
          return isLoading ? (
            <></>
          ) : locate && !dataSource.length ? (
            <div className="no-resource-with-locate">
              <strong>No resource with Id or self was found</strong>
              <em> Please use the filter bar for more options</em>
            </div>
          ) : (
            <Empty />
          );
        },
      }}
    />
  );
};

export default MyDataTable;
