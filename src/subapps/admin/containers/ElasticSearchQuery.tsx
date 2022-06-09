import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { DEFAULT_ELASTIC_SEARCH_VIEW_ID } from '@bbp/nexus-sdk';

import ElasticSearchQueryForm from '../components/ViewForm/ElasticSearchQueryForm';

const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_QUERY = {
  query: {
    term: {
      _deprecated: false,
    },
  },
};

const ElasticSearchQueryContainer: React.FunctionComponent<{
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
  const [query, setQuery] = React.useState<object>(
    initialQuery || DEFAULT_QUERY
  );
  const [{ from, size }, setPagination] = React.useState({
    from: 0,
    size: DEFAULT_PAGE_SIZE,
  });
  const [{ response, busy, error }, setResponse] = React.useState({
    response: null,
    busy: false,
    error: null,
  });

  React.useEffect(() => {
    setResponse({
      response: null,
      busy: true,
      error: null,
    });
    nexus.View.elasticSearchQuery(orgLabel, projectLabel, viewId, query, {
      from,
      size,
    })
      .then(response => {
        setResponse({
          response,
          busy: false,
          error: null,
        });
      })
      .catch(error => {
        setResponse({
          error,
          response: null,
          busy: false,
        });
      });
  }, [from, size, orgLabel, projectLabel, viewId, query]);

  const onPaginationChange = (pageNumber: number) => {
    // NOTE: AntD Page numbers start from 1!
    const from = size * (pageNumber - 1);
    setPagination(p => ({
      from,
      size: p.size,
    }));
  };

  const onQueryChange = (query: object) => {
    setQuery(query);
  };

  const onChangePageSize = (size: number) => {
    setPagination({
      size,
      from: 0,
    });
  };

  return (
    <ElasticSearchQueryForm
      query={query}
      response={response}
      busy={busy}
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
