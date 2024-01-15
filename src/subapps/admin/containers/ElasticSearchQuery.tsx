import { useState, FC } from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import {
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  ElasticSearchViewQueryResponse,
} from '@bbp/nexus-sdk/es';

import ElasticSearchQueryForm, {
  NexusESError,
} from '../components/ViewForm/ElasticSearchQueryForm';
import { useQuery } from 'react-query';

const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_QUERY = {
  query: {
    term: {
      _deprecated: false,
    },
  },
};

const ElasticSearchQueryContainer: FC<{
  orgLabel: string;
  projectLabel: string;
  initialQuery?: object;
  viewId?: string;
}> = ({
  orgLabel,
  projectLabel,
  initialQuery,
  viewId = DEFAULT_ELASTIC_SEARCH_VIEW_ID,
}) => {
  const nexus = useNexusContext();
  const [query, setQuery] = useState<object>(initialQuery || DEFAULT_QUERY);
  const [{ from, size }, setPagination] = useState({
    from: 0,
    size: DEFAULT_PAGE_SIZE,
  });

  const { data, isLoading, error } = useQuery<
    ElasticSearchViewQueryResponse<any>,
    NexusESError
  >({
    queryKey: [
      `elastic-query-${orgLabel}-${projectLabel}`,
      { from, size, viewId, query },
    ],
    queryFn: () =>
      nexus.View.elasticSearchQuery(orgLabel, projectLabel, viewId, query, {
        from,
        size,
      }),
  });

  const onPaginationChange = (pageNumber: number) => {
    // NOTE: AntD Page numbers start from 1!
    const from = size * (pageNumber - 1);
    setPagination(p => ({
      from,
      size: p.size,
    }));
  };

  const onQueryChange = (query: object) => setQuery(query);

  const onChangePageSize = (size: number) =>
    setPagination({
      size,
      from: 0,
    });

  return (
    <ElasticSearchQueryForm
      query={query}
      response={data}
      busy={isLoading}
      error={error}
      from={from}
      size={size}
      onPaginationChange={onPaginationChange}
      onQueryChange={onQueryChange}
      onChangePageSize={onChangePageSize}
    />
  );
};

export default ElasticSearchQueryContainer;
