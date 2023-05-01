import React, {
  Fragment,
  useEffect,
  useReducer,
  useRef,
  useMemo,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { PromisePool } from '@supercharge/promise-pool';
import { AccessControl, useNexusContext } from '@bbp/react-nexus';
import { ArchivePayload, NexusClient } from '@bbp/nexus-sdk';
import { useMutation } from 'react-query';
import { useSelector } from 'react-redux';
import { clsx } from 'clsx';
import {
  isArray,
  toUpper,
  isEmpty,
  isNil,
  compact,
  groupBy,
  flatMap,
  omit,
  slice,
  isString,
  has,
  filter,
} from 'lodash';
import { animate, spring } from 'motion';
import {
  Button,
  Checkbox,
  Dropdown,
  Table,
  Tag,
  Tooltip,
  notification,
} from 'antd';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import { ColumnsType } from 'antd/lib/table';

import {
  FileDoneOutlined,
  DownloadOutlined,
  CloseOutlined,
  CloseSquareOutlined,
  FileZipOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  makeOrgProjectTuple,
  TDataSource,
  TResourceTableData,
} from '../../molecules/MyDataTable/MyDataTable';
import { parseProjectUrl, uuidv4 } from '../../../shared/utils';
import { ParsedNexusUrl, parseURL } from '../../../shared/utils/nexusParse';
import { RootState } from '../../../shared/store/reducers';
import useOnClickOutside from '../../../shared/hooks/useClickOutside';
import isValidUrl from '../../../utils/validUrl';
import formatBytes from '../../../utils/formatBytesUnit';

import './styles.less';

type Props = {
  authenticated?: boolean;
  token?: string;
};
type DownloadResourcePayload = {
  '@type': string;
  resourceId: string;
  project: string;
  path: string;
};

type TDataPanel = {
  resources: TResourceTableData;
  openDataPanel: boolean;
};
export class DataPanelEvent<T> extends Event {
  detail: T | undefined;
}
export const DATA_PANEL_STORAGE_EVENT = 'datapanelupdated';
export const DATA_PANEL_STORAGE = 'datapanel-storage';

function sum(...args: number[]) {
  return args.reduce((a, b) => a + b, 0);
}

function findIndexes(arr: any[], predicate: any) {
  const indexes: number[] = [];
  arr.forEach((item, index) => {
    if (predicate(item)) {
      indexes.push(index);
    }
  });
  return indexes;
}
function removeIndeces(arr: any[], indicesToRemove: number[]) {
  return arr.filter((_, index) => !indicesToRemove.includes(index));
}

function makePayload(resourcesPayload: DownloadResourcePayload[]) {
  const archiveId = uuidv4();
  const payload: ArchivePayload = {
    archiveId,
    resources: resourcesPayload,
  };
  return { payload, archiveId };
}
type TResourceObscured = {
  size: number;
  contentType: string | undefined;
  distribution:
    | {
        contentSize: number;
        encodingFormat: string | string[];
        label: string | string[];
      }
    | undefined;
  _self: string;
  '@type': string;
  resourceId: string;
  project: string;
  path: string;
}[];

async function downloadArchive({
  nexus,
  parsedData,
  resourcesPayload,
  format,
}: {
  nexus: NexusClient;
  parsedData: ParsedNexusUrl;
  resourcesPayload: TResourceObscured;
  format?: 'x-tar' | 'json';
}) {
  const resourcesWithoutDistribution = resourcesPayload.filter(
    item => !has(item, 'distribution')
  );
  const resourcesWithDistribution = resourcesPayload.filter(item =>
    has(item, 'distribution')
  );

  const { results } = await PromisePool.withConcurrency(4)
    .for(resourcesWithDistribution)
    .process(async item => {
      const [orgLabel, projectLabel] = item?.project.split('/')!;
      const result = await nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(item?.resourceId!)
      );
      const resource = await nexus.httpGet({
        // @ts-ignore
        path: result.distribution!.contentUrl!,
        headers: {
          accept: 'application/ld+json',
        },
      });
      return {
        ...item,
        resourceId: resource['@id'],
      };
    });
  const resources = [...resourcesWithoutDistribution, ...results].map(item =>
    omit(item, ['distribution', 'size', 'contentType'])
  );
  const {
    payload,
    archiveId,
  }: { payload: ArchivePayload; archiveId: string } = makePayload(resources);
  try {
    // TODO: if the resource is a file, when we added it to the cart, it will be downloaded
    // TODO: if the resource is not file but has distribution, the download not working
    await nexus.Archive.create(parsedData.org, parsedData.project, payload);
  } catch (error) {}
  try {
    const archive = await nexus.Archive.get(
      parsedData.org,
      parsedData.project,
      archiveId,
      { as: 'x-tar' }
    );
    const blob =
      !format || format === 'x-tar'
        ? (archive as Blob)
        : new Blob([archive.toString()]);
    return {
      blob,
      archiveId,
      format,
    };
  } catch (error) {
    console.log('@@donwload error', error);
    // @ts-ignore
    throw new Error('can not fetch archive', { cause: error });
  }
}

const DataPanel: React.FC<Props> = ({}) => {
  const nexus = useNexusContext();
  const [types, setTypes] = useState<string[]>([]);
  const datapanelRef = useRef<HTMLDivElement>(null);
  const dataLS = localStorage.getItem(DATA_PANEL_STORAGE);
  const [{ openDataPanel, resources }, updateDataPanel] = useReducer(
    (previous: TDataPanel, newPartialState: Partial<TDataPanel>) => ({
      ...previous,
      ...newPartialState,
    }),
    {
      resources: JSON.parse(dataLS!),
      openDataPanel: false,
    }
  );

  const totalSelectedResources = resources?.selectedRowKeys?.length;
  const dataSource: TDataSource[] = resources?.selectedRows || [];
  const columns: ColumnsType<TDataSource> = [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      fixed: true,
      render: text => (isValidUrl(text) ? `${text.split('/').pop()}` : text),
    },
    {
      key: 'project',
      title: 'project',
      dataIndex: 'project',
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
    },
    {
      key: 'type',
      title: 'type',
      dataIndex: 'type',
      render: text => {
        let types = '';
        let fullText = '';
        if (isArray(text)) {
          types = text
            .map(item => (isValidUrl(item) ? item.split('/').pop() : item))
            .join('\n');
          fullText = text.join('\n');
        } else if (isString(text)) {
          types = isValidUrl(text) ? text.split('/').pop() ?? '' : '';
        } else {
          types = text;
        }
        return (
          <Tooltip title={text}>
            <div style={{ whiteSpace: 'pre-wrap' }}>{types}</div>
          </Tooltip>
        );
      },
    },
    {
      key: 'actions',
      title: 'actions',
      dataIndex: 'actions',
      render: (_, record) => {
        return (
          <Button
            className="remove-data-item"
            onClick={() => handleRemoveItemFromDataPanel(record)}
          >
            Remove
            <CloseSquareOutlined />
          </Button>
        );
      },
    },
  ];

  const handleClearSelectedItems = () => {
    updateDataPanel({
      resources: { selectedRowKeys: [], selectedRows: [] },
    });
    localStorage.removeItem(DATA_PANEL_STORAGE);
    window.dispatchEvent(
      new CustomEvent(DATA_PANEL_STORAGE_EVENT, {
        detail: {
          datapanel: { selectedRowKeys: [], selectedRows: [] },
        },
      })
    );
  };
  const handleRemoveItemFromDataPanel = (record: TDataSource) => {
    const selectedRowKeys = resources.selectedRowKeys.filter(
      t => t !== record.key
    );
    const selectedRows = resources.selectedRows.filter(
      t => t.key !== record.key
    );
    localStorage.setItem(
      DATA_PANEL_STORAGE,
      JSON.stringify({ selectedRowKeys, selectedRows })
    );
    window.dispatchEvent(
      new CustomEvent(DATA_PANEL_STORAGE_EVENT, {
        detail: {
          datapanel: { selectedRowKeys, selectedRows },
        },
      })
    );
    updateDataPanel({ resources: { selectedRowKeys, selectedRows } });
  };
  const handleOpenDataPanel: React.MouseEventHandler<HTMLDivElement> = e => {
    e.preventDefault();
    e.stopPropagation();
    updateDataPanel({ openDataPanel: true });
  };
  const handleCloseDataPanel = () => {
    updateDataPanel({ openDataPanel: false });
    datapanelRef.current &&
      animate(
        datapanelRef.current,
        {
          height: '0px',
          opacity: 0,
          display: 'none',
        },
        {
          duration: 1,
          easing: spring(),
        }
      );
  };
  const resourceProjectPaths = useMemo(
    () => [
      ...new Set(
        dataSource
          .filter(r => !isNil(r.project))
          ?.map(r => {
            const [orgLabel, projectLabel] = parseProjectUrl(r.project);
            return `/${orgLabel}/${projectLabel}`;
          })
      ),
    ],
    [dataSource]
  );
  const resourcesGrouped = useMemo(() => {
    const newDataSource = dataSource
      .filter(resource => !isNil(resource._self))
      .map(resource => {
        const url = isArray(resource._self)
          ? resource._self[0]
          : resource._self;
        try {
          const parsedSelf = parseURL(url);
          const pathId = resource.id.split('/').pop();
          const size = resource.distribution
            ? isArray(resource.distribution?.contentSize)
              ? sum(...resource.distribution.contentSize)
              : resource.distribution.contentSize
            : 0;
          const contentType = resource.distribution
            ? isArray(resource.distribution?.label)
              ? resource.distribution?.label[0].split('.').pop()
              : resource.distribution?.label.split('.').pop() ?? ''
            : '';
          return {
            size,
            contentType,
            distribution: resource.distribution,
            _self: resource._self,
            '@type':
              Boolean(resource.distribution) &&
              Boolean(resource.distribution?.contentSize)
                ? 'File'
                : 'Resource',
            resourceId: resource.id,
            project: `${parsedSelf.org}/${parsedSelf.project}`,
            path: `/${parsedSelf.project}/${pathId}${
              contentType ? `.${contentType}` : ''
            }`,
          };
        } catch (error) {
          return;
        }
      });
    return groupBy(newDataSource, 'contentType');
  }, [dataSource]);
  const handleFileTypeChange = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      setTypes(state => [...state, e.target.value]);
    } else {
      setTypes(types.filter(t => t !== e.target.value));
    }
  };
  const existedTypes = compact(Object.keys(resourcesGrouped));
  const typesCounter = compact(
    Object.entries(resourcesGrouped).map(([key, value]) =>
      key ? { [key]: value.length } : null
    )
  );
  const displayedTypes = slice(typesCounter, 0, 3);
  const dropdownTypes = slice(typesCounter, 3);
  const typesMenu = dropdownTypes.map(item => {
    const key = Object.keys(item)[0];
    const value = item[key];
    return {
      key: `type-${key}`,
      label: (
        <Checkbox
          value={key}
          checked={types.includes(key)}
          onChange={handleFileTypeChange}
        >
          {`${toUpper(key)} (${value})`}
        </Checkbox>
      ),
    };
  });
  const resultsObject = useMemo(() => {
    if (types.length) {
      return flatMap(
        Object.entries(resourcesGrouped).map(([key, value]) => {
          if (types.includes(key)) {
            return value;
          }
          return null;
        })
      );
    }
    return flatMap(resourcesGrouped);
  }, [types, resourcesGrouped]);
  const resourcesObscured = filter(
    flatMap(resultsObject),
    i => !isEmpty(i) && !isNil(i)
  );
  const totalSize = sum(
    ...compact(flatMap(resultsObject).map(item => item?.size))
  );

  const parsedData: ParsedNexusUrl | undefined = resourcesObscured.length
    ? parseURL(resourcesObscured.find(item => !!item!._self)?._self as string)
    : undefined;
  const { mutateAsync: downloadSelectedResource, status } = useMutation(
    downloadArchive
  );
  const handleDownloadResourcesArchive = () => {
    if (parsedData) {
      downloadSelectedResource(
        {
          nexus,
          parsedData,
          resourcesPayload: resourcesObscured as TResourceObscured,
        },
        {
          onSuccess: data => {
            const url = window.URL.createObjectURL(new Blob([data.blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `data-${data.archiveId}.tar`);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
          },
          onError: (error: any) => {
            notification.error({
              message: (
                <div>
                  <strong>Error when downloading archive</strong>
                  <div>{error.cause?.['@type']}</div>
                </div>
              ),
              description: <em>{error.cause?.reason}</em>,
            });
          },
        }
      );
    }
  };
  useEffect(() => {
    const dataPanelEventListner = (
      event: DataPanelEvent<{ datapanel: TResourceTableData }>
    ) => {
      updateDataPanel({
        resources: event.detail?.datapanel,
        openDataPanel: false,
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
  useEffect(() => {
    if (openDataPanel && datapanelRef.current) {
      animate(
        datapanelRef.current,
        {
          height: '500px',
          display: 'flex',
          opacity: 1,
        },
        {
          duration: 0.3,
          easing: 'ease-out',
        }
      );
    }
  }, [datapanelRef.current, openDataPanel]);

  useOnClickOutside(
    datapanelRef,
    () => openDataPanel && handleCloseDataPanel()
  );
  return Boolean(dataSource.length) ? (
    <div className="datapanel">
      <div ref={datapanelRef} className="datapanel-content">
        <div className="datapanel-content-wrapper">
          <div className="header">
            <div className="title">
              <span>Your saved items</span>
              <Button
                type="link"
                className="clear-data"
                onClick={handleClearSelectedItems}
              >
                Clear all data
              </Button>
            </div>
            <Button
              onClick={handleCloseDataPanel}
              type="link"
              className="btn-icon-trigger"
              icon={<CloseOutlined />}
            />
          </div>
          <div className="items">
            <Table<TDataSource>
              rowKey={record => `dp-${record.key}`}
              columns={columns}
              dataSource={dataSource}
              bordered={false}
              showSorterTooltip={false}
              showHeader={false}
              className="my-data-panel-table"
              rowClassName="my-data-panel-table-row"
              pagination={false}
              scroll={{ y: 400 }}
            />
          </div>
        </div>
      </div>
      <div className="datapanel-bar">
        <div className="left">
          <div className="selected-items" onClick={handleOpenDataPanel}>
            <FileDoneOutlined />
            <span>{totalSelectedResources} elements selected</span>
          </div>
        </div>
        <div
          className={clsx(
            'download-options',
            Boolean(totalSize) && 'sized',
            Boolean(existedTypes) && 'exts'
          )}
        >
          {Boolean(existedTypes.length) && (
            <div className="download-filetypes">
              <div className="download-filetypes-first">
                {displayedTypes.map(item => {
                  const key = Object.keys(item)[0];
                  const value = item[key];
                  return (
                    <Checkbox
                      key={`type-${key}`}
                      value={key}
                      checked={types.includes(key)}
                      onChange={handleFileTypeChange}
                    >
                      {`${toUpper(key)} (${value})`}
                    </Checkbox>
                  );
                })}
                {Boolean(dropdownTypes.length) && (
                  <Dropdown
                    placement="topRight"
                    arrow={false}
                    trigger={['click']}
                    menu={{ items: typesMenu }}
                    overlayClassName="types-dropdown"
                    destroyPopupOnHide={true}
                  >
                    <Button
                      type="link"
                      icon={<PlusOutlined style={{ color: 'white' }} />}
                    />
                  </Dropdown>
                )}
              </div>
            </div>
          )}
          {Boolean(totalSize) && (
            <div className="download-size">
              <FileZipOutlined />
              <span>{formatBytes(totalSize)}</span>
            </div>
          )}
          <AccessControl
            path={resourceProjectPaths}
            permissions={['archives/write']}
            noAccessComponent={() => <></>}
          >
            <div className="download-btn">
              <Button
                type="link"
                onClick={handleDownloadResourcesArchive}
                loading={status === 'loading'}
              >
                <DownloadOutlined />
                Download
              </Button>
            </div>
          </AccessControl>
        </div>
      </div>
    </div>
  ) : null;
};

export default DataPanel;

const withDataPanel = ({
  allowDataPanel,
}: {
  allowDataPanel: boolean;
}) => () => {
  return allowDataPanel ? <DataPanel /> : null;
};

export { withDataPanel };
