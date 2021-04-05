import { SparqlView, Resource, View, NexusClient } from '@bbp/nexus-sdk';
import { sparqlQueryExecutor } from '../utils/querySparqlView';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as bodybuilder from 'bodybuilder';
import { useNexusContext } from '@bbp/react-nexus';
import { addColumnsForES } from '../utils/parseESResults';
import { parseJsonMaybe } from '../utils/index';
import { TablePaginationConfig } from 'antd/lib/table/interface';
import * as React from 'react';

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

function parseESResults(result: any) {
  console.log(result);
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
const searchNexus = async (
  query: Object,
  nexus: NexusClient,
  orgLabel: string,
  projectLabel: string,
  viewId: string,
  paginationSize: number,
  paginationFrom: number,
  sort?: TableSort
) => {
  const body = bodybuilder();
  const TOTAL_HITS_TRACKING = 1000000;

  body
    .filter('term', '_deprecated', false)
    .size(paginationSize)
    .from(paginationFrom)
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
  nexus: NexusClient,
  pagination?: TablePaginationConfig
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
    const paginationFrom = pagination?.current ? pagination.current : 0;
    const paginationSize = pagination?.pageSize ? pagination.pageSize : 10;
    const result = await searchNexus(
      {},
      nexus,
      orgLabel,
      projectLabel,
      view['@id'],
      paginationSize,
      paginationFrom
    );

    const { items, total } = parseESResults(result);

    const headerProperties = DEFAULT_FIELDS.map(field => {
      // Enrich certain fields with custom rendering
      return addColumnsForES(field, sorter);
    });

    return { headerProperties, items, total };
  }
  const result = await sparqlQueryExecutor(
    nexus,
    dataQuery,
    view as SparqlView
  );
  const headerProperties = result.headerProperties;
  const items = result.items;
  return { headerProperties, items, total: items.length };
};

export const useAccessDataForTable = (
  orgLabel: string,
  projectLabel: string,
  tableResourceId: string
) => {
  const [pagination, setPagination] = React.useState<TablePaginationConfig>({
    pageSize: 10,
    current: 0,
    onChange: (page: number, pageSize?: number) => {
      setPagination({ ...pagination, current: page });
    },
  });
  const nexus = useNexusContext();
  const result = useQuery([tableResourceId, pagination.current], async () => {
    const result = await accessData(
      orgLabel,
      projectLabel,
      tableResourceId,
      nexus,
      pagination
    );
    return result;
  });
  const downloadCSV = () => {};
  const addToDataCart = () => {};
  const addFromDataCart = () => {};

  return { downloadCSV, addToDataCart, addFromDataCart, pagination, result };
};
