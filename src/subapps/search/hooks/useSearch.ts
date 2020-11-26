import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import * as bodybuilder from 'bodybuilder';

import { parseURL } from '../libs/nexusParse';
import { Resource } from '@bbp/nexus-sdk';
import useAsyncCall, { AsyncCall } from '../../../shared/hooks/useAsynCall';

const DEFAULT_PAGE_SIZE = 20;

const testViewID =
  'https://staging.nexus.ocp.bbp.epfl.ch/v1/resources/kenny-test-org-october/kenny-test-project/_/f1f30a61-c342-4a4a-aae0-d116a436082b';
const { org, project, id } = parseURL(testViewID);

// const RESULTS_SIZE = 99999;

interface SearchResponse<T> {
  took: number;
  timed_out: boolean;
  _scroll_id?: string;
  // _shards: ShardsResponse;
  hits: {
    total: {
      value: number;
    };
    max_score: number;
    hits: {
      _index: string;
      _type: string;
      _id: string;
      _score: number;
      _source: T;
      _version?: number;
      // _explanation?: Explanation;
      fields?: any;
      highlight?: any;
      inner_hits?: any;
      matched_queries?: string[];
      sort?: string[];
    }[];
  };
  aggregations?: any;
}

export type UseSearchProps = {
  query?: string;
  sort?: {
    key: string;
    direction: 'desc' | 'asc';
  };
  pagination?: {
    from: number;
    size: number;
  };
  facetMap?: Map<
    string,
    {
      propertyKey: string;
      label: string;
      type: 'terms';
      value: Set<string>;
    }
  >;
};

export default function useSearch() {
  const [searchProps, setSearchProps] = React.useState<UseSearchProps>({});
  const {
    sort = {
      key: '_createdAt',
      direction: 'desc',
    },
    query,
    pagination = { from: 0, size: DEFAULT_PAGE_SIZE },
    facetMap = new Map<
      string,
      {
        propertyKey: string;
        label: string;
        type: 'terms';
        value: Set<string>;
      }
    >(),
  } = searchProps;

  const nexus = useNexusContext();

  const searchNexus = async () => {
    const matchQuery = query
      ? ['match', '_original_source', query]
      : ['match_all', {}];

    const body = bodybuilder();

    body
      // @ts-ignore
      .query(...matchQuery)
      .filter('term', '_deprecated', false)
      .sort(sort.key, sort.direction);

    facetMap.forEach(({ propertyKey, type, label, value }) => {
      value.forEach(item => {
        body.filter('term', propertyKey, item);
      });
      body.aggregation(type, propertyKey, label);
    });

    body.size(pagination.size).from(pagination.from);

    const finalQuery = body.build();

    return await nexus.View.elasticSearchQuery<SearchResponse<Resource>>(
      org,
      project,
      id,
      finalQuery
    );
  };

  const remoteResponse = useAsyncCall<SearchResponse<Resource>, Error>(
    searchNexus(),
    [searchProps]
  );

  return [remoteResponse, { searchProps, setSearchProps }] as [
    AsyncCall<SearchResponse<Resource>>,
    {
      searchProps: UseSearchProps;
      setSearchProps: React.Dispatch<React.SetStateAction<UseSearchProps>>;
    }
  ];
}
