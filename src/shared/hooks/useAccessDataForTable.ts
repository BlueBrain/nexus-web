import { SparqlView, Resource, View, NexusClient } from '@bbp/nexus-sdk';
import { sparqlQueryExecutor } from '../utils/querySparqlView';
import { useQuery } from 'react-query';
import * as bodybuilder from 'bodybuilder';
import { useNexusContext } from '@bbp/react-nexus';
import { addColumnsForES } from '../utils/parseESResults';
import { parseJsonMaybe } from '../utils/index';
import { download } from '../utils/download';
import json2csv, { Parser } from 'json2csv';
import * as React from 'react';
export const EXPORT_CSV_FILENAME = 'nexus-query-result.csv';
export const CSV_MEDIATYPE = 'text/csv';
import { CartContext } from '../hooks/useDataCart';
import { pick } from 'lodash';

export type TableResource = Resource<{
  '@type': string;
  name: string;
  description: string;
  tableOf?: {
    '@id': string;
  };
  view: string;
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

export const DEFAULT_FIELDS = [
  {
    title: 'Label',
    dataIndex: 'label',
    key: 'label',
    displayIndex: 0,
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
const sorter = (dataIndex: string) => {
  return (
    a: {
      [key: string]: any;
    },
    b: {
      [key: string]: any;
    }
  ) => {
    const sortA = a[dataIndex];
    const sortB = b[dataIndex];
    if (sortA < sortB) {
      return -1;
    }
    if (sortA > sortB) {
      return 1;
    }
    return 0;
  };
};

export async function querySparql(
  nexus: NexusClient,
  dataQuery: string,
  view: View
) {
  const result = await sparqlQueryExecutor(
    nexus,
    dataQuery,
    view as SparqlView
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
      key: hit._source._self,
    };
  });
  return { total, items: parsedResult };
}

export const queryES = async (
  query: Object,
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string,
  viewId: string,
  sort?: TableSort
) => {
  const body = bodybuilder();
  const TOTAL_HITS_TRACKING = 1000000;
  const PAGE_SIZE = 10000;
  const PAGE_START = 0;

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

  return await nexus.View.elasticSearchQuery(
    orgLabel,
    projectLabel,
    encodeURIComponent(viewId),
    {
      ...bodyQuery,
      ...query,
    }
  );
};

const accessData = async (
  orgLabel: string,
  projectLabel: string,
  tableResource: TableResource,
  view: View,
  nexus: NexusClient
) => {
  const dataQuery: string = tableResource.dataQuery;
  const columnConfig = tableResource.configuration as TableColumn[];
  if (view['@type']?.includes('ElasticSearchView')) {
    const result = await queryES(
      JSON.parse(dataQuery),
      nexus,
      orgLabel,
      projectLabel,
      view['@id']
    );

    const { items, total } = parseESResults(result);

    const fields =
      columnConfig.map((x, index) => ({
        title: x.name,
        dataIndex: x.name,
        key: x.name,
        displayIndex: index,
        sortable: x.enableSort,
      })) || DEFAULT_FIELDS;

    const headerProperties = fields
      .map(field => {
        // Enrich certain fields with custom rendering

        return addColumnsForES(field, sorter);
      })
      .sort((a, b) => (a.title > b.title ? 1 : 0));

    return { items, total, tableResource, view, headerProperties };
  }
  const result = await querySparql(nexus, dataQuery, view);
  const headerProperties: {
    title: string;
    dataIndex: string;
    sorter?: (dataIndex: string) => any;
  }[] = result.headerProperties.map(headerProp => {
    const currentConfig = columnConfig.find(c => c.name === headerProp.title);
    if (currentConfig && currentConfig.enableSort) {
      return {
        ...headerProp,
        sorter,
      };
    }
    return headerProp;
  });

  return { ...result, headerProperties, tableResource };
};

export const useAccessDataForTable = (
  orgLabel: string,
  projectLabel: string,
  tableResourceId: string,
  tableResource?: Resource
) => {
  const revision = tableResource ? tableResource._rev : 0;
  const nexus = useNexusContext();
  const [selectedResources, setSelectedResources] = React.useState<Resource[]>(
    []
  );
  const [selectedRows, setSelectedRows] = React.useState<React.Key[]>([]);

  const [searchValue, setSearchValue] = React.useState<string>('');
  const { addResourceCollectionToCart } = React.useContext(CartContext);
  const onSelect = (selectedRowKeys: React.Key[], selectedRows: Resource[]) => {
    setSelectedRows(selectedRowKeys);
    if (
      dataResult?.data?.view &&
      dataResult?.data?.view['@type']?.includes('ElasticSearchView')
    ) {
      setSelectedResources(selectedRows);
    } else {
      const resources = selectedRows.map(s => ({
        '@id': s.self['value'],
        _self: decodeURIComponent(s.self['value']),
      })) as Resource[];
      setSelectedResources(resources);
    }
  };

  const tableResult = useQuery<any, Error>(
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
          nexus
        );

        return result;
      }
      return {};
    },
    {
      cacheTime: 100000,
      retry: false,
      select: data => {
        const table = data.tableResource as TableResource;
        if (table) {
          const columnConfig = table.configuration
            ? Array.isArray(table.configuration)
              ? (table.configuration as TableColumn[])
              : ([table.configuration] as TableColumn[])
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
        selectedRows.length > 0
          ? dataResult.data.items.filter((item: any) => {
              return selectedRows.includes(item.key);
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
    onSelect,
    setSearchValue,
    tableResult,
    dataResult,
  };
};
