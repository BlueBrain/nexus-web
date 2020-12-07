import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import * as bodybuilder from 'bodybuilder';

import { Resource } from '@bbp/nexus-sdk';
import useAsyncCall, { AsyncCall } from './useAsynCall';
import { parseURL } from '../utils/nexusParse';
import { SearchResponse } from '../types/search';

const DEFAULT_PAGE_SIZE = 20;

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

export default function useSearchQuery(selfURL?: string | null) {
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
    if (!selfURL) {
      return null;
    }

    // TODO fix query to match @id's as well
    const matchQuery = query
      ? ['wildcard', '_original_source', `${query}*`]
      : ['match_all', {}];

    const body = bodybuilder();

    body
      // @ts-ignore
      .filter(...matchQuery)
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
    const { org, project, id } = parseURL(selfURL);
    console.log('in', { query });

    return await nexus.View.elasticSearchQuery<SearchResponse<Resource>>(
      org,
      project,
      encodeURIComponent(id),
      finalQuery
    );
  };

  console.log({ searchProps });

  const remoteResponse = useAsyncCall<SearchResponse<Resource> | null, Error>(
    searchNexus(),
    [searchProps, selfURL]
  );

  return [remoteResponse, { searchProps, setSearchProps }] as [
    AsyncCall<SearchResponse<Resource>>,
    {
      searchProps: UseSearchProps;
      setSearchProps: React.Dispatch<React.SetStateAction<UseSearchProps>>;
    }
  ];
}
