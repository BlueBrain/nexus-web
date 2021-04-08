import { SparqlView, Resource, View, NexusClient } from '@bbp/nexus-sdk';
import { sparqlQueryExecutor } from '../utils/querySparqlView';
import { useQuery, useMutation, useQueryClient } from 'react-query';
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

async function querySparql(nexus: NexusClient, dataQuery: string, view: View) {
  const result = await sparqlQueryExecutor(
    nexus,
    dataQuery,
    view as SparqlView
  );
  const headerProperties = result.headerProperties;
  const items = result.items;
  return { headerProperties, items, total: items.length };
}

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

function parseESResults(result: any) {
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
const queryES = async (
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

  return await nexus.View.elasticSearchQuery(orgLabel, projectLabel, viewId, {
    ...bodyQuery,
    ...query,
  });
};

const accessData = async (
  orgLabel: string,
  projectLabel: string,
  tableResourceId: string,
  nexus: NexusClient
) => {
  const tableResource = (await nexus.Resource.get(
    orgLabel,
    projectLabel,
    tableResourceId
  )) as Resource;

  const view: View = (await nexus.View.get(
    orgLabel,
    projectLabel,
    tableResource.view
  )) as View;

  const dataQuery: string = tableResource.dataQuery;
  if (view['@type']?.includes('ElasticSearchView')) {
    const result = await queryES(
      {},
      nexus,
      orgLabel,
      projectLabel,
      view['@id']
    );

    const { items, total } = parseESResults(result);

    const headerProperties = DEFAULT_FIELDS.map(field => {
      // Enrich certain fields with custom rendering
      return addColumnsForES(field, sorter);
    });

    return { headerProperties, items, total };
  }
  return await querySparql(nexus, dataQuery, view);
};

export const useAccessDataForTable = (
  orgLabel: string,
  projectLabel: string,
  tableResourceId: string
) => {
  const nexus = useNexusContext();
  const [selectedResources, setSelectedResources] = React.useState<Resource[]>(
    []
  );

  const [searchValue, setSearchValue] = React.useState<string>('');
  const { addResourceCollectionToCart } = React.useContext(CartContext);
  const onSelect = (selectedRowKeys: React.Key[], selectedRows: Resource[]) => {
    setSelectedResources(selectedRows);
  };

  const result = useQuery(
    [tableResourceId],
    async () => {
      const result = await accessData(
        orgLabel,
        projectLabel,
        tableResourceId,
        nexus
      );

      return result;
    },
    {
      cacheTime: 100000,
      select: data => {
        const items = data.items.filter((item: any) => {
          return (
            Object.values(item)
              .join(' ')
              .toLowerCase()
              .search((searchValue || '').toLowerCase()) >= 0
          );
        });

        return {
          ...data,
          items,
        };
      },
    }
  );

  const downloadCSV = React.useMemo(
    () => () => {
      if (result.isSuccess) {
        exportAsCSV(
          result.data.items,
          result.data.headerProperties.map((h: any) => {
            return {
              label: h.title,
              value: h.dataIndex,
            };
          })
        );
      }
    },
    [result]
  );
  const addToDataCart = React.useMemo(
    () => () => {
      if (selectedResources && addResourceCollectionToCart) {
        addResourceCollectionToCart(selectedResources).then(response => {
          // succeed silently.
        });
      }
    },
    [selectedResources, addResourceCollectionToCart]
  );
  const addFromDataCart = () => {};

  return {
    downloadCSV,
    addToDataCart,
    addFromDataCart,
    onSelect,
    setSearchValue,
    result,
  };
};
