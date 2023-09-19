import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk/es';
import { useHistory, useLocation } from 'react-router-dom';
import React, { Key, useEffect, useReducer, useState } from 'react';
import {
  Table,
  Col,
  Row,
  Button,
  Typography,
  Input,
  Spin,
  Modal,
  Popover,
  notification as antnotifcation,
} from 'antd';
import {
  DownloadOutlined,
  ShoppingCartOutlined,
  DeleteOutlined,
  EditOutlined,
  SmallDashOutlined,
} from '@ant-design/icons';

import '../styles/data-table.scss';
import { useAccessDataForTable } from '../hooks/useAccessDataForTable';
import EditTableForm, { Projection } from '../components/EditTableForm';
import { useMutation } from 'react-query';
import { parseProjectUrl } from '../utils';
import useNotification from '../hooks/useNotification';
import { ErrorComponent } from '../components/ErrorComponent';
import { useSelector } from 'react-redux';
import {
  DATA_PANEL_STORAGE,
  DATA_PANEL_STORAGE_EVENT,
  DataPanelEvent,
} from '../organisms/DataPanel/DataPanel';
import { TResourceTableData } from '../molecules/MyDataTable/MyDataTable';
import { RootState } from '../../shared/store/reducers';

export type TableColumn = {
  '@type': string;
  name: string;
  format: string;
  enableSearch: boolean;
  enableSort: boolean;
  enableFilter: boolean;
};

export type TableResource = Resource<{
  '@id': string;
  '@type': string;
  name: string;
  description: string;
  tableOf?: {
    '@id': string;
  };
  view: string;
  projection: Projection;
  enableSearch: boolean;
  enableInteractiveRows: boolean;
  enableDownload: boolean;
  enableSave: boolean;
  resultsPerPage: number;
  dataQuery: string;
  configuration: TableColumn | TableColumn[];
}>;

export type UnsavedTableResource = {
  '@type': 'FusionTable';
  '@context': string;
  name: string;
  description: string;
  tableOf?: {
    '@id': string;
  };
  view: string;
  projection: Projection;
  enableSearch: boolean;
  enableInteractiveRows: boolean;
  enableDownload: boolean;
  enableSave: boolean;
  resultsPerPage: number;
  dataQuery: string;
  configuration: TableColumn | TableColumn[];
};

type DataTableProps = {
  orgLabel: string;
  projectLabel: string;
  tableResourceId: string;
  onDeprecate?: () => void;
  onSave?: (data: TableResource | UnsavedTableResource) => void;
  options: {
    disableDelete: boolean;
    disableAddFromCart: boolean;
    disableEdit: boolean;
  };
  showEdit?: boolean;
  toggledEdit?: (show: boolean) => void;
};

export interface TableError {
  reason?: string;
  '@type'?: string;
}

export interface StudioTableRow {
  self: { type: string; value: string };
  entity: string;
  name: string;
  id: string;
  key: string; // index in table;
  _self?: string;
  '@id'?: string;
  tableKey: string;
}

export const getStudioLocalStorageKey = (row: StudioTableRow) =>
  row.self?.value ?? row.id ?? row['@id'];

export const getStudioTableKey = (row: StudioTableRow, index: number) =>
  `${getStudioLocalStorageKey(row)}-index${index}`;

export const tableKeyToLocalStorageKey = (localStorageKey?: string) =>
  localStorageKey?.replace(/-index[0-9]*/, '');

const { Title } = Typography;

const DataTableContainer: React.FC<DataTableProps> = ({
  orgLabel,
  projectLabel,
  tableResourceId,
  onDeprecate,
  onSave,
  options,
  showEdit,
  toggledEdit,
}) => {
  const basePath =
    useSelector((state: RootState) => state.config.basePath) || '';
  const [showEditForm, setShowEditForm] = useState<boolean>(showEdit || false);
  const [tableDataError, setTableDataError] = useState<null | Error>(null);
  const [displayedRows, setDisplayedRows] = useState(0);

  useEffect(() => {
    setShowEditForm(showEdit || false);
  }, [showEdit]);

  useEffect(() => {
    toggledEdit && toggledEdit(showEditForm);
  }, [showEditForm]);

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

  useEffect(() => {
    // Initialize the selected rows when window is reloaded.
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

  const [searchboxValue, setSearchboxValue] = useState<string>('');
  const [searchboxFocused, setSearchboxFocused] = useState<boolean>(false);
  const [fetchingRowsForDownlaod, setFetchingRowsForDownload] = useState<
    boolean
  >(false);
  const nexus = useNexusContext();
  const history = useHistory();
  const location = useLocation();
  const notification = useNotification();

  const goToStudioResource = (selfUrl: string) => {
    nexus
      .httpGet({
        path: selfUrl,
        headers: { Accept: 'application/json' },
      })
      .then((resource: Resource) => {
        if (resource['@type'] === 'Project') {
          return;
        }
        nexus
          .httpGet({
            path: `${selfUrl}?format=expanded`,
            headers: { Accept: 'application/json' },
          })
          .then((fullIdResponse: Resource) => {
            const [orgLabel, projectLabel] = parseProjectUrl(resource._project);
            const hist = `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
              fullIdResponse[0]['@id']
            )}`;
            history.push(hist, { background: location });
          });
      })
      .catch(() => {
        notification.error({ message: `Resource ${self} could not be found` });
      });
  };

  const confirmDeprecate = () => {
    Modal.confirm({
      title: 'Deprecate Table',
      content: 'Are you sure?',
      onOk: deprecateTableResource.mutate,
    });
  };

  const deprecateTable = async () => {
    const latest = (await nexus.Resource.get(
      orgLabel,
      projectLabel,
      encodeURIComponent(tableResourceId)
    )) as Resource;
    const deprecated = nexus.Resource.deprecate(
      orgLabel,
      projectLabel,
      encodeURIComponent(tableResourceId),
      latest._rev
    );
    return deprecated;
  };
  const deprecateTableResource = useMutation(deprecateTable, {
    onMutate: () => {
      Modal.destroyAll();
    },
    onSuccess: () => {
      onDeprecate && onDeprecate();
      notification.success({
        message: 'Table deprecated',
      });
    },
    onError: () => {
      notification.error({
        message: 'Failed to delete table',
      });
    },
  });

  const latestResource = async (data: TableResource) => {
    return (await nexus.Resource.get(
      orgLabel,
      projectLabel,
      encodeURIComponent(data['@id'])
    )) as Resource;
  };
  const updateTable = async (data: TableResource | UnsavedTableResource) => {
    if ('@id' in data) {
      const latest = await latestResource(data);
      return nexus.Resource.update(
        orgLabel,
        projectLabel,
        encodeURIComponent(data['@id']),
        latest._rev,
        { ...latest, ...data }
      );
    }
    const resource = await nexus.Resource.create(orgLabel, projectLabel, data);
    return resource;
  };

  const changeTableResource = useMutation(updateTable, {
    onMutate: (data: TableResource | UnsavedTableResource) => {
      onSave && onSave(data);
    },
    onSuccess: () => {
      setTableDataError(null);
      setShowEditForm(false);
    },
    onError: () => {
      notification.error({
        message: 'Failed to save table data',
      });
    },
  });

  const tableData = useAccessDataForTable(
    orgLabel,
    projectLabel,
    tableResourceId,
    basePath,
    err => setTableDataError(err),
    changeTableResource.data
  );

  const renderTitle = ({
    disableDelete,
    disableAddFromCart,
    disableEdit,
  }: {
    disableDelete: boolean;
    disableAddFromCart: boolean;
    disableEdit: boolean;
  }) => {
    const tableResource = tableData.tableResult.data
      ?.tableResource as TableResource;
    const tableOptionsContent = (
      <div className="wrapper">
        {!disableEdit && (
          <div>
            <Button
              block
              type="default"
              icon={<EditOutlined />}
              onClick={() => {
                setShowEditForm(true);
              }}
            >
              Edit
            </Button>
          </div>
        )}
        {tableResource && tableResource.enableSave && !disableAddFromCart && (
          <div>
            <Button
              block
              icon={<ShoppingCartOutlined />}
              type="default"
              onClick={tableData.addFromDataCart}
            >
              Add From Cart
            </Button>
          </div>
        )}
        {tableResource ? (
          tableResource.enableDownload ? (
            <div>
              <Button
                block
                icon={<DownloadOutlined />}
                type="default"
                onClick={tableData.downloadCSV}
              >
                Download CSV
              </Button>
            </div>
          ) : null
        ) : null}
        {!disableDelete && (
          <div>
            <Button
              block
              danger
              icon={<DeleteOutlined />}
              onClick={confirmDeprecate}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
    );
    const options = (
      <Popover
        style={{ background: 'none' }}
        placement="rightTop"
        content={tableOptionsContent}
        trigger="click"
      >
        <Button shape="round" type="default" icon={<SmallDashOutlined />} />
      </Popover>
    );
    const search = (
      <Input.Search
        placeholder="Search"
        allowClear
        value={searchboxValue}
        onChange={e => setSearchboxValue(e.target.value)}
        onSearch={value => {
          tableData.setSearchValue(value);
        }}
        onFocus={() => setSearchboxFocused(true)}
        onBlur={() => setSearchboxFocused(false)}
        style={{
          width: searchboxValue === '' && !searchboxFocused ? '150px' : '330px',
          transition: 'width 0.5s',
          maxWidth: '70%',
        }}
      ></Input.Search>
    );
    return (
      <div>
        <Row gutter={[16, 16]} align="middle">
          <Col span={16}>
            <Title
              className="table-title"
              level={3}
              title={
                tableResource && tableResource.name
                  ? tableResource.name
                  : undefined
              }
            >
              {tableResource && tableResource.name ? tableResource.name : null}
            </Title>
          </Col>
          <Col span={8} className="table-options">
            <div className="table-options__inner">
              {tableResource?.enableSearch && search}
              <span className="table-row-count">
                {/* If the user filters a column (i.e. updates) or enters a serch term (i.e. update dataResult), show the total rows in format <rows shown to user>/<total rows>, otherwise only show total rows. */}
                {displayedRows &&
                displayedRows !== tableData.dataResult.data?.items?.length
                  ? `${displayedRows} / `
                  : tableData.dataResult?.data?.items.length !==
                    tableData.dataResult.data?.total
                  ? `${tableData.dataResult.data?.items?.length} /`
                  : ''}
                {`${tableData.dataResult?.data?.total ?? 0} `}
                Results
              </span>
              {(!disableEdit ||
                !disableAddFromCart ||
                tableResource.enableDownload ||
                tableResource.enableSave ||
                !disableDelete) &&
                options}
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  const getSelectedRowKeys = (
    localStorageKeys: Key[],
    allRows?: StudioTableRow[]
  ) => {
    return allRows
      ?.filter(tRow => {
        return localStorageKeys.includes(
          tableKeyToLocalStorageKey(tRow.tableKey!) ?? ''
        );
      })
      .map(row => row.tableKey!);
  };

  return (
    <div className="studio-table-container">
      {/* Error when the table resource itself failed to fetch */}
      {tableData.tableResult.isError ? (
        <ErrorComponent
          message={
            tableData.tableResult.error.reason ?? 'Table failed to fetch'
          }
          details={tableData.tableResult.error['@type']}
        />
      ) : tableData.tableResult.isSuccess ? (
        <>
          <Table
            bordered
            loading={
              tableData.dataResult.isLoading ||
              tableData.tableResult.isLoading ||
              fetchingRowsForDownlaod
            }
            rowClassName={'data-table-row'}
            title={() => renderTitle(options)}
            columns={tableData.dataResult.data?.headerProperties}
            dataSource={tableData.dataResult.data?.items}
            scroll={{ x: 1000 }}
            onRow={data => ({
              onClick: event => {
                event.preventDefault();
                const self = data._self || data.self.value;
                goToStudioResource(self);
              },
            })}
            pagination={{
              pageSize: 50,
              responsive: true,
              showLessItems: true,
            }}
            rowSelection={{
              selectedRowKeys: getSelectedRowKeys(
                selectedRowKeys,
                tableData.dataResult.data?.items
              ),
              onSelect: async (record: StudioTableRow, selected: boolean) => {
                const selectedStorageKey = getStudioLocalStorageKey(record);
                await tableData.onSelectSingleRow(record, selected);

                // If there are studio rows with self same as the self of `record`, then those rows are automatically "selected".
                // Calculate the number of such rows and notify the user.
                const additionalSelectedRows: number = tableData.dataResult?.data?.items?.filter(
                  (item: StudioTableRow) =>
                    getStudioLocalStorageKey(item) === selectedStorageKey
                ).length;

                if (additionalSelectedRows > 1) {
                  antnotifcation.info({
                    duration: 5,
                    message: `${additionalSelectedRows -
                      1} other resources with same metadata have also been automatically ${
                      selected ? 'selected' : 'unselected'
                    } for download.`,
                  });
                }
              },
              onSelectAll: async (
                selected: boolean,
                selectedRows: StudioTableRow[],
                changedRows: StudioTableRow[]
              ) => {
                setFetchingRowsForDownload(true);

                await tableData.onSelectAll(
                  selected,
                  selectedRows,
                  changedRows
                );

                // If there are studio rows with self same as the self of `changedRows`, then those rows are automatically "selected".
                // Calculate the number of such rows and notify the user.
                const uniqueKeysSelected = new Set<string>();
                const selectedTableKeys = changedRows.map(r => r.tableKey);
                let additionalSelectedRows = 0;

                changedRows.forEach(row => {
                  const localStorageKey = getStudioLocalStorageKey(row);

                  if (!uniqueKeysSelected.has(localStorageKey)) {
                    uniqueKeysSelected.add(localStorageKey);

                    const matchingRows = tableData.dataResult?.data?.items.filter(
                      (item: StudioTableRow) =>
                        !selectedTableKeys.includes(item.tableKey) && // keys that were selected deliberately by the user should not be counted.
                        getStudioLocalStorageKey(item) === localStorageKey
                    ).length;

                    additionalSelectedRows += matchingRows;
                  }
                });
                if (additionalSelectedRows > 0) {
                  antnotifcation.info({
                    duration: 5,
                    message: `${additionalSelectedRows} other resources with same metadata have also been automatically ${
                      selected ? 'selected' : 'unselected'
                    } for download.`,
                  });
                }

                setFetchingRowsForDownload(false);
              },
            }}
            rowKey={r => r.tableKey!}
            data-testid="dashboard-table"
            onChange={(page, fileter, sorter, extra) => {
              setDisplayedRows(extra.currentDataSource?.length ?? 0);
            }}
          />
          <Modal
            open={showEditForm}
            footer={null}
            onCancel={() => setShowEditForm(false)}
            width={950}
            destroyOnClose={true}
          >
            <EditTableForm
              onSave={changeTableResource.mutate}
              onClose={() => setShowEditForm(false)}
              onError={err => setTableDataError(err)}
              table={tableData.tableResult.data.tableResource}
              busy={changeTableResource.isLoading}
              orgLabel={orgLabel}
              projectLabel={projectLabel}
            />
          </Modal>
          {/* Error when the data within the table resource failed */}
          {tableDataError && (
            <ErrorComponent
              message={tableDataError.message}
              // @ts-ignore - TODO: Remove ts-ignore once we support es2022 in ts.
              details={(tableDataError.cause as any)?.details}
            />
          )}
        </>
      ) : (
        <Spin></Spin>
      )}
    </div>
  );
};

export default DataTableContainer;
