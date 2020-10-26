import * as React from 'react';
import { RequestParams } from '@elastic/elasticsearch';
import { useNexusContext } from '@bbp/react-nexus';
import * as bodybuilder from 'bodybuilder';

import useRemoteCall from './useRemoteCall';
import { parseURL } from '../libs/nexusParse';
import { Resource } from '@bbp/nexus-sdk';

console.log({ bodybuilder });

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
  pagination?: {
    from: number;
    size: number;
  };
};

export default function useSearch(props: UseSearchProps = {}) {
  const { query, pagination = { from: 0, size: DEFAULT_PAGE_SIZE } } = props;

  const nexus = useNexusContext();

  const searchNexus = async () => {
    const matchQuery = query
      ? ['match', '_original_source', query]
      : ['match_all'];

    const body = bodybuilder()
      .filter('term', '_deprecated', false)
      .aggregation('terms', '@type', 'types')
      .aggregation('terms', '_constrainedBy', 'schemas')
      .aggregation('terms', '_project', 'projects')
      .size(pagination.size)
      .from(pagination.from)
      .build();

    console.log({ body });

    return await nexus.View.elasticSearchQuery<SearchResponse<Resource>>(
      org,
      project,
      id,
      body
    );
  };

  const remoteResponse = useRemoteCall<SearchResponse<Resource>>(
    searchNexus,
    []
  );

  return remoteResponse;
}
