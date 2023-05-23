import * as Sentry from '@sentry/browser';
import { PromisePool } from '@supercharge/promise-pool';
import React, {
  Fragment,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';

import { ArchivePayload, NexusClient, Resource } from '@bbp/nexus-sdk';
import { AccessControl, useNexusContext } from '@bbp/react-nexus';
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
import { clsx } from 'clsx';
import {
  compact,
  filter,
  flatMap,
  groupBy,
  has,
  isArray,
  isEmpty,
  isNil,
  isString,
  omit,
  slice,
  toUpper,
  uniqBy,
} from 'lodash';
import { animate, spring } from 'motion';
import { useMutation } from 'react-query';

import {
  CloseOutlined,
  CloseSquareOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileDoneOutlined,
  FileZipOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import useOnClickOutside from '../../../shared/hooks/useClickOutside';
import { parseProjectUrl, uuidv4 } from '../../../shared/utils';
import { ParsedNexusUrl, parseURL } from '../../../shared/utils/nexusParse';
import formatBytes from '../../../utils/formatBytesUnit';
import isValidUrl from '../../../utils/validUrl';
import {
  TDataSource,
  TResourceTableData,
  makeOrgProjectTuple,
} from '../../molecules/MyDataTable/MyDataTable';

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

function getPathForParentWithDistribution(parent: ResourceObscured) {
  const pathWithoutExtension = parent.path.substring(
    0,
    parent.path.lastIndexOf('.')
  );
  const metadataName = `metadata-${uuidv4().substring(0, 6)}`;
  return `${pathWithoutExtension}/${metadataName}.json`;
}

function getPathForChildResource(resource: any, parent: ResourceObscured) {
  const extension = resource._filename?.split('.').pop() ?? '';

  // Distributions within different resources can have same name. Add a unique id to avoid conflicts in paths and delta error.
  const uniqueSuffix = uuidv4().substring(0, 6);

  const resourceName = resource._filename
    ? `${resource._filename.split('.')[0] ?? 'data'}-${uniqueSuffix}`
    : uniqueSuffix;
  const parentPath = parent.path.substring(0, parent.path.lastIndexOf('.'));

  return `${parentPath}/${resourceName}.${extension}`;
}

function makePayload(resourcesPayload: DownloadResourcePayload[]) {
  const archiveId = uuidv4();
  const payload: ArchivePayload = {
    archiveId,
    resources: resourcesPayload,
  };
  return { payload, archiveId };
}

type ResourceObscured = {
  size: number;
  contentType: string | undefined;
  distribution:
    | {
        contentSize: number;
        encodingFormat: string | string[];
        label: string | string[];
        hasDistribution: boolean;
      }
    | undefined;
  _self: string;
  '@type': string;
  resourceId: string;
  project: string;
  path: string;
};

type TResourceObscured = ResourceObscured[];
type TResourceDistribution = Resource<{}> & { distribution: any };

async function downloadArchive({
  nexus,
  parsedData,
  resourcesPayload,
  format,
  size,
}: {
  nexus: NexusClient;
  parsedData: ParsedNexusUrl;
  resourcesPayload: TResourceObscured;
  format?: 'x-tar' | 'json';
  size: string;
}) {
  const resourcesWithoutDistribution = resourcesPayload.filter(
    item => !item.distribution?.hasDistribution
  );
  const resourcesWithDistribution = resourcesPayload.filter(
    item => has(item, 'distribution') && item.distribution?.hasDistribution
  );

  const { results, errors } = await PromisePool.withConcurrency(4)
    .for(resourcesWithDistribution)
    .process(async item => {
      const [orgLabel, projectLabel] = item?.project.split('/')!;
      const result = (await nexus.Resource.get<TResourceDistribution>(
        orgLabel,
        projectLabel,
        encodeURIComponent(item?.resourceId!)
      )) as TResourceDistribution;

      const files: TResourceObscured[] = [];
      // @ts-ignore
      if (isArray(result.distribution)) {
        // For resources with distribution(s), we want to download both, the metadata as well as all its distribution(s).
        // To do that, first prepare the metadata for download.
        resourcesWithoutDistribution.push({
          ...item,
          path: getPathForParentWithDistribution(item),
          contentType: 'json',
          '@type': 'Resource',
        });

        // 2. Now download each of the distribution(s) within that resource
        for (const res of result.distribution) {
          try {
            const resource = await nexus.httpGet({
              path: res.contentUrl!,
              headers: { accept: 'application/ld+json' },
            });
            files.push({
              ...item,
              // @ts-ignore
              path: getPathForChildResource(resource, item),
              _self: resource._self ?? item._self,
              resourceId: resource['@id'],
            });
          } catch (err) {
            console.error('Error fetching resource for download', err);
          }
        }
      } else {
        try {
          const resource: TResourceDistribution = await nexus.httpGet({
            path: result.distribution?.contentUrl!,
            headers: {
              accept: 'application/ld+json',
            },
          });
          files.push({
            ...item,
            // @ts-ignore
            resourceId: resource['@id'],
          });
        } catch (err) {
          console.error('Error fetching resource for download', err);
        }
      }
      return files;
    });
  const resources = uniqBy(
    [...resourcesWithoutDistribution, ...results.flat()].map(item =>
      omit(item, ['distribution', 'size', 'contentType'])
    ),
    '_self'
  );
  const {
    payload,
    archiveId,
  }: // @ts-ignore
  { payload: ArchivePayload; archiveId: string } = makePayload(resources);
  try {
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
      errors,
      blob,
      archiveId,
      format,
    };
  } catch (error) {
    Sentry.captureException({
      size,
      error,
      items: payload.resources.length,
    });
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
          const resourceName = isValidUrl(resource.id)
            ? resource.id.split('/').pop()
            : resource.id;
          const pathId = resourceName?.length
            ? resourceName
            : uuidv4().substring(0, 6);
          const size = resource.distribution
            ? isArray(resource.distribution?.contentSize)
              ? sum(...resource.distribution.contentSize)
              : resource.distribution.contentSize
            : 0;
          const contentType = resource.distribution
            ? isArray(resource.distribution?.label)
              ? resource.distribution?.label[0].split('.').pop()
              : resource.distribution?.label?.split('.').pop() ?? ''
            : '';
          return {
            size,
            contentType: contentType?.toLowerCase(),
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
          console.log('@@error', resource.id, error);
          return;
        }
      });
    return groupBy(newDataSource, 'contentType');
  }, [dataSource]);

  const existedTypes = compact(Object.keys(resourcesGrouped)).filter(
    i => i !== 'undefined'
  );

  const handleFileTypeChange = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      setTypes(state => [...state, e.target.value]);
    } else {
      setTypes(types.filter(t => t !== e.target.value));
    }
  };

  const typesCounter = compact(
    Object.entries(resourcesGrouped).map(([key, value]) =>
      isEmpty(key) || isNil(key) || key === 'undefined' || key === ''
        ? null
        : { [key]: value.length }
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
    ? parseURL(resourcesObscured?.find(item => !!item!._self)?._self as string)
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
          size: formatBytes(totalSize),
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
            if (data.errors.length) {
              notification.warning({
                message: (
                  <span>
                    <strong>Archive: </strong>
                    {data.archiveId}
                  </span>
                ),
                description: <em>{`Selected data downloaded with errors`}</em>,
              });
            } else {
              notification.success({
                message: (
                  <span>
                    <strong>Archive: </strong>
                    {data.archiveId}
                  </span>
                ),
                description: <em>Selected data downloaded successfully</em>,
              });
            }
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
          <DeleteOutlined
            style={{ marginLeft: 10, color: 'white' }}
            onClick={handleClearSelectedItems}
          />
        </div>
        <div
          className={clsx(
            'download-options',
            Boolean(totalSize) && 'sized',
            Boolean(existedTypes.length) && 'exts'
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
