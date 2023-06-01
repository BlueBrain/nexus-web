import { FilterFilled } from '@ant-design/icons';
import { NexusClient, Resource, SparqlView, View } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { notification } from 'antd';
import { ColumnType } from 'antd/lib/table/interface';
import * as bodybuilder from 'bodybuilder';
import json2csv, { Parser } from 'json2csv';
import {
  get,
  has,
  isArray,
  isNil,
  isString,
  pick,
  sum,
  sumBy,
  toNumber,
  uniq,
  uniqBy,
} from 'lodash';
import * as React from 'react';
import { useQuery } from 'react-query';
import {
  StudioTableRow,
  TableError,
  getStudioRowKey,
} from '../../shared/containers/DataTableContainer';
import {
  MAX_DATA_SELECTED_SIZE__IN_BYTES,
  MAX_LOCAL_STORAGE_ALLOWED_SIZE,
  TDataSource,
  TResourceTableData,
  getLocalStorageSize,
  notifyTotalSizeExeeced,
} from '../../shared/molecules/MyDataTable/MyDataTable';
import {
  DATA_PANEL_STORAGE,
  DATA_PANEL_STORAGE_EVENT,
} from '../../shared/organisms/DataPanel/DataPanel';
import {
  removeLocalStorageRows,
  toLocalStorageResources,
} from '../../shared/utils/datapanel';
import isValidUrl, { isUrlCurieFormat } from '../../utils/validUrl';
import { Projection } from '../components/EditTableForm';
import { download } from '../utils/download';
import { isNumeric, parseJsonMaybe } from '../utils/index';
import { addColumnsForES, rowRender } from '../utils/parseESResults';
import { sparqlQueryExecutor } from '../utils/querySparqlView';
import { CartContext } from './useDataCart';

export const EXPORT_CSV_FILENAME = 'nexus-query-result.csv';
export const CSV_MEDIATYPE = 'text/csv';

export type TableResource = Resource<{
  '@type': string;
  name: string;
  description: string;
  tableOf?: {
    '@id': string;
  };
  view: string;
  projection?: Projection;
  enableSearch: boolean;
  enableInteractiveRows: boolean;
  enableDownload: boolean;
  enableSave: boolean;
  resultsPerPage: number;
  dataQuery: string;
  configuration: TableColumn | TableColumn[];
}>;
export type TableColumn = {
  '@type': string;
  name: string;
  format: string;
  enableSearch: boolean;
  enableSort: boolean;
  enableFilter: boolean;
};

const exportAsCSV = (
  object: object,
  fields: json2csv.Options<any>['fields']
) => {
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(object);

  download(EXPORT_CSV_FILENAME, CSV_MEDIATYPE, csv);
};

export enum SortDirection {
  DESCENDING = 'desc',
  ASCENDING = 'asc',
}

export type TableSort = {
  key: string;
  direction: SortDirection;
};

export const DEFAULT_FIELDS = (basePath: string) => [
  {
    title: 'Label',
    dataIndex: 'label',
    key: 'label',
    displayIndex: 0,
    render: (value: string) => rowRender(value, basePath),
  },
  {
    title: 'Project',
    dataIndex: '_project',
    sortable: true,
    key: 'project',
    displayIndex: 1,
  },
  {
    title: 'Types',
    dataIndex: '@type',
    sortable: true,
    key: '@type',
    displayIndex: 3,
  },
];

type ColumnSorter = (
  a: Record<string, any>,
  b: Record<string, any>
) => -1 | 1 | 0;

const normalizeString = (str: string) => str.trim().toLowerCase();

const sorter = (dataIndex: string): ColumnSorter => {
  return (
    a: {
      [key: string]: any;
    },
    b: {
      [key: string]: any;
    }
  ) => {
    return sortFn(a[dataIndex], b[dataIndex]);
  };
};

const sortFn = (datumA: any, datumB: any) => {
  const normalizedA = isNumeric(datumA)
    ? toNumber(datumA)
    : isString(datumA)
    ? normalizeString(datumA)
    : datumA;
  const normalizedB = isNumeric(datumB)
    ? toNumber(datumB)
    : isString(datumB)
    ? normalizeString(datumB)
    : datumB;
  if (normalizedA < normalizedB) {
    return -1;
  }
  if (normalizedA > normalizedB) {
    return 1;
  }
  return 0;
};

type Row = Record<string, any>;

type TableFilterConfig<T> = Pick<
  ColumnType<T>,
  'filters' | 'onFilter' | 'filterIcon'
>;

export type FusionColumnType<T> = ColumnType<T> & {
  dataIndex: string;
  title: string;
};

export type FilterConfigByColumnFn = (
  columnHeader: FusionColumnType<Row>
) => TableFilterConfig<Row>;

type FilterConfigFn = (tableItems: Row[]) => FilterConfigByColumnFn;

/**
 * Generates the filtering configuration for antd tables for a given column.
 *
 * @param rows - All the rows of the table
 * @returns - A function that accepts a column header and returns the filter configuration for that column.
 */
export const antTableFilterConfig: FilterConfigFn = rows => columnHeader => {
  const filters = uniqueFilters(rows, columnHeader.dataIndex);

  const onFilter = (value: string | number | boolean, row: Row) => {
    const cellValue = row[columnHeader.dataIndex]?.toString() ?? '';
    return normalizeString(cellValue).includes(
      normalizeString(value as string)
    );
  };

  const filterIcon = <FilterFilled data-testid="filter-icon" />;

  return { filters, onFilter, filterIcon };
};

const uniqueFilters = (items: Record<string, any>[], dataIndex: string) => {
  const uniqueItems = new Set(
    items.map(i => {
      return i[dataIndex];
    })
  );
  return Array.from(uniqueItems)
    .sort((a, b) => sortFn(a, b))
    .map(i => ({ text: i, value: i }));
};

export async function querySparql(
  nexus: NexusClient,
  dataQuery: string,
  view: View,
  hasProjection: boolean,
  projectionId?: string
) {
  const result = await sparqlQueryExecutor(
    nexus,
    dataQuery,
    view as SparqlView,
    hasProjection,
    projectionId
  );

  const headerProperties = result.headerProperties;

  const items = result.items;
  return { headerProperties, items, total: items.length };
}

export function parseESResults(result: any) {
  const total = result.hits.total.value || 0;
  const parsedResult = (result.hits.hits || []).map((hit: any) => {
    const { _original_source = {}, ...everythingElse } = hit._source;

    const resource = {
      ...(parseJsonMaybe(_original_source) || {}),
      ...everythingElse,
    };

    return {
      ...resource,
    };
  });
  return { total, items: parsedResult };
}

export const queryES = async (
  query: string,
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string,
  viewId: string,
  hasProjection: boolean,
  projectionId?: string,
  sort?: TableSort
) => {
  const body = bodybuilder();
  const TOTAL_HITS_TRACKING = 1000000;
  const PAGE_SIZE = 10000;
  const PAGE_START = 0;
  let esQuery;
  try {
    esQuery = JSON.parse(query);
  } catch (err) {
    // @ts-ignore TODO: Remove ts-ignore once we support es2022 in ts (or above).
    throw new Error('ES Query is an invalid JSON', {
      cause: { details: `Query submitted is an invalid JSON: ${query}` },
    });
  }
  /* removed as causing issues */
  body
    .filter('term', '_deprecated', false)
    .size(PAGE_SIZE)
    .from(PAGE_START)
    .rawOption('track_total_hits', TOTAL_HITS_TRACKING);

  // Sorting
  if (Array.isArray(sort)) {
    sort.forEach(sort => {
      body.sort(sort.key, sort.direction);
    });
  } else {
    sort && body.sort(sort.key, sort.direction);
  }

  const bodyQuery = body.build();

  if (hasProjection) {
    return await nexus.View.compositeElasticSearchQuery(
      orgLabel,
      projectLabel,
      encodeURIComponent(viewId),
      encodeURIComponent(projectionId || '_'), // _ for all projections
      {
        ...bodyQuery,
        ...esQuery,
      }
    );
  }
  return await nexus.View.elasticSearchQuery(
    orgLabel,
    projectLabel,
    encodeURIComponent(viewId),
    {
      ...bodyQuery,
      ...esQuery,
    }
  );
};

const accessData = async (
  orgLabel: string,
  projectLabel: string,
  tableResource: TableResource,
  view: View,
  nexus: NexusClient,
  basePath: string
) => {
  const dataQuery: string = tableResource.dataQuery;
  const columnConfig: TableColumn[] = [tableResource.configuration].flat();
  if (
    view['@type']?.includes('ElasticSearchView') ||
    view['@type']?.includes('AggregateElasticSearchView') ||
    tableResource.projection?.['@type']?.includes('ElasticSearchProjection')
  ) {
    const result = await queryES(
      dataQuery,
      nexus,
      orgLabel,
      projectLabel,
      view['@id'],
      !!tableResource.projection,
      tableResource.projection?.['@id'] === 'All_ElasticSearchProjection'
        ? undefined
        : tableResource.projection?.['@id']
    );

    const { items, total } = parseESResults(result);

    const fields =
      columnConfig.length > 0
        ? columnConfig.map((x, index) => ({
            title: x.name,
            dataIndex: x.name,
            key: x.name,
            displayIndex: index,
            sortable: x.enableSort,
            filterable: x.enableFilter,
          }))
        : DEFAULT_FIELDS(basePath);

    const headerProperties = fields
      .map((field: any) =>
        // Enrich certain fields with custom rendering
        addColumnsForES(field, sorter, antTableFilterConfig(items), basePath)
      )
      .sort((a, b) => (a.title > b.title ? 1 : 0));

    return { items, total, tableResource, view, headerProperties };
  }

  const result = await querySparql(
    nexus,
    dataQuery,
    view,
    !!tableResource.projection,
    tableResource.projection?.['@id'] === 'All_SparqlProjection'
      ? undefined
      : tableResource.projection?.['@id']
  );

  const headerProperties = result.headerProperties.map(headerProp => {
    const currentConfig = columnConfig.find(
      c => c.name === headerProp.dataIndex
    );

    if (isNil(currentConfig)) {
      return headerProp;
    }

    return {
      ...headerProp,
      className: `testid-${headerProp.dataIndex}`,
      ...(currentConfig.enableSort && {
        sorter: sorter(headerProp.dataIndex),
      }),
      ...(currentConfig.enableFilter &&
        antTableFilterConfig(result.items)(headerProp)),
    };
  });

  return { ...result, headerProperties, tableResource };
};

const getTotalContentSize = (rows: TDataSource[]) => {
  let size = 0;

  rows.forEach(row => {
    if (isArray(row.distribution)) {
      size += sumBy(
        row.distribution,
        distItem => distItem.contentSize?.value ?? 0
      );
    } else {
      size += row.distribution?.contentSize || 0;
    }
  });

  return size;
};

export const useAccessDataForTable = (
  orgLabel: string,
  projectLabel: string,
  tableResourceId: string,
  basePath: string,
  onError: (err: Error) => void,
  tableResource?: Resource
) => {
  const revision = tableResource ? tableResource._rev : 0;
  const nexus = useNexusContext();
  const [selectedResources, setSelectedResources] = React.useState<Resource[]>(
    []
  );
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<React.Key[]>([]);

  const [searchValue, setSearchValue] = React.useState<string>('');
  const { addResourceCollectionToCart } = React.useContext(CartContext);

  const onSelectAll = async (
    selected: boolean,
    selectedRows: StudioTableRow[],
    changedRows: StudioTableRow[]
  ) => {
    const dataPanelLS: TResourceTableData = JSON.parse(
      localStorage.getItem(DATA_PANEL_STORAGE)!
    );

    let rowKeysForLS = dataPanelLS?.selectedRowKeys || [];
    let rowsForLS = dataPanelLS?.selectedRows || [];

    if (selected) {
      rowKeysForLS = [
        ...rowKeysForLS,
        ...changedRows.map(row => getStudioRowKey(row)),
      ];

      const futureResources = changedRows.map(row =>
        fetchResourceForDownload(getStudioRowKey(row))
      );

      Promise.allSettled(futureResources)
        .then(result => {
          result.forEach(res => {
            if (res.status === 'fulfilled') {
              const localStorageResource = toLocalStorageResources(
                res.value,
                'studios'
              );
              rowsForLS = [...rowsForLS, ...localStorageResource];
            }
          });
          return;
        })
        .then(() => {
          saveSelectedRowsToLocalStorage(rowKeysForLS, rowsForLS);
        })
        .catch(err => {
          console.log('@@error', err);
        });
    } else {
      const rowKeysToRemove = changedRows.map(row => getStudioRowKey(row));

      rowKeysForLS = rowKeysForLS.filter(
        lsRowKey => !rowKeysToRemove.includes(lsRowKey.toString())
      );
      rowsForLS = removeLocalStorageRows(rowsForLS, rowKeysToRemove);

      saveSelectedRowsToLocalStorage(rowKeysForLS, rowsForLS);
    }
  };

  const onSelectSingleRow = async (
    record: StudioTableRow,
    selected: boolean
  ) => {
    const recordKey = getStudioRowKey(record);

    const dataPanelLS: TResourceTableData = JSON.parse(
      localStorage.getItem(DATA_PANEL_STORAGE)!
    );

    let localStorageRowKeys = dataPanelLS?.selectedRowKeys || [];
    let localStorageRows = dataPanelLS?.selectedRows || [];

    if (selected) {
      const deltaResource = await fetchResourceForDownload(recordKey);
      const localStorageResource = toLocalStorageResources(
        deltaResource,
        'studios'
      );
      localStorageRowKeys = [...localStorageRowKeys, recordKey];
      localStorageRows = [...localStorageRows, ...localStorageResource];
    } else {
      localStorageRowKeys = localStorageRowKeys.filter(t => t !== recordKey);
      localStorageRows = removeLocalStorageRows(localStorageRows, [recordKey]);
    }

    saveSelectedRowsToLocalStorage(localStorageRowKeys, localStorageRows);
  };

  const fetchResourceForDownload = async (
    selfUrl: string
  ): Promise<Resource> => {
    let compactResource;
    let expandedResource;

    try {
      compactResource = await nexus.httpGet({
        path: selfUrl,
        headers: { Accept: 'application/json' },
      });

      const receivedExpandedId =
        isValidUrl(compactResource['@id']) &&
        !isUrlCurieFormat(compactResource['@id']);

      if (receivedExpandedId) {
        return compactResource;
      }

      expandedResource = await nexus.httpGet({
        path: `${selfUrl}?format=expanded`,
        headers: { Accept: 'application/json' },
      });

      return {
        ...compactResource,
        ['@id']:
          expandedResource?.[0]?.['@id'] ??
          expandedResource['@id'] ??
          compactResource['@id'],
      };
    } catch (err) {
      notification.warning({
        message: (
          <div>Could not fetch a resource with id for download {selfUrl}</div>
        ),
        description: <em>{(err as any)?.reason ?? (err as any)?.['@type']}</em>,
        key: selfUrl,
      });
      // @ts-ignore TODO: Remove when we supprot es2022 in ts.
      throw new Error(`Could not select resource ${selfUrl} for download`, {
        cause: err,
      });
    }
  };

  const saveSelectedRowsToLocalStorage = (
    rowKeys: React.Key[],
    rows: TDataSource[]
  ) => {
    const currentLocalStorageSize = getLocalStorageSize();
    const newLocalStorageSize = getTotalContentSize(rows);
    if (
      newLocalStorageSize > MAX_DATA_SELECTED_SIZE__IN_BYTES ||
      currentLocalStorageSize > MAX_LOCAL_STORAGE_ALLOWED_SIZE
    ) {
      return notifyTotalSizeExeeced();
    }

    localStorage.setItem(
      DATA_PANEL_STORAGE,
      JSON.stringify({
        selectedRowKeys: rowKeys,
        selectedRows: rows,
      })
    );

    window.dispatchEvent(
      new CustomEvent(DATA_PANEL_STORAGE_EVENT, {
        detail: {
          datapanel: {
            selectedRowKeys: rowKeys,
            selectedRows: rows,
          },
        },
      })
    );
  };

  const tableResult = useQuery<any, TableError>(
    [tableResourceId, revision],
    async () => {
      const tableResource = (await nexus.Resource.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(tableResourceId)
      )) as TableResource;

      const view: View = (await nexus.View.get(
        orgLabel,
        projectLabel,
        encodeURIComponent(tableResource.view)
      )) as View;
      return { tableResource, view };
    },
    {
      retry: false,
    }
  );

  const dataResult = useQuery<any, Error>(
    [tableResult.data],
    async () => {
      if (tableResult.isSuccess) {
        const result = await accessData(
          orgLabel,
          projectLabel,
          tableResult.data.tableResource,
          tableResult.data.view,
          nexus,
          basePath
        );

        return result;
      }
      return {};
    },
    {
      cacheTime: 100000,
      retry: false,
      refetchOnWindowFocus: false,
      onError: (err: any) => {
        const message =
          err.reason ?? err.message ?? err.name ?? 'Failed to fetch for table';
        // @ts-ignore TODO: Remove ts-ignore when we support es2022 for ts.
        onError(new Error(message, { cause: err.cause ?? err.details }));
      },
      select: data => {
        const table = data.tableResource as TableResource;
        if (table) {
          const columnConfig = table.configuration
            ? ([table.configuration].flat() as TableColumn[])
            : [];

          const searchable = columnConfig
            .filter(t => t.enableSearch)
            .map(t => t.name);
          const items = data.items.filter((item: any) => {
            const searchableProp = pick(item, ...searchable);
            return (
              Object.values(searchableProp)
                .join(' ')
                .toLowerCase()
                .search((searchValue || '').toLowerCase()) >= 0
            );
          });

          return {
            ...data,
            items,
          };
        }
        return data;
      },
    }
  );

  const downloadCSV = React.useCallback(() => {
    if (dataResult.isSuccess) {
      // download only selected rows or,
      // download everything, when nothing is selected.
      const selectedItems =
        selectedRowKeys.length > 0
          ? dataResult.data.items.filter((item: any) => {
              return selectedRowKeys.includes(item.key);
            })
          : dataResult.data.items;

      exportAsCSV(
        selectedItems,
        dataResult.data.headerProperties.map((h: any) => {
          return {
            label: h.title,
            value: h.dataIndex,
          };
        })
      );
    }
  }, [dataResult]);
  const addToDataCart = React.useCallback(() => {
    if (selectedResources && addResourceCollectionToCart) {
      addResourceCollectionToCart(selectedResources).then(response => {
        // succeed silently.
      });
    }
  }, [selectedResources, addResourceCollectionToCart]);
  const addFromDataCart = () => {};

  return {
    downloadCSV,
    addToDataCart,
    addFromDataCart,
    onSelectAll,
    setSearchValue,
    tableResult,
    dataResult,
    onSelectSingleRow,
  };
};
