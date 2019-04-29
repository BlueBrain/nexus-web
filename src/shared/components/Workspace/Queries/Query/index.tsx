import * as React from 'react';
import { PaginationSettings, Resource, NexusFile } from '@bbp/nexus-sdk';
import { FilterQuery } from '../../../../store/actions/queryResource';
import { List } from '../../../../store/reducers/lists';
import QueryComponent from './QueryComponent';

interface QueryContainerProps {
  list: List;
  pageSize: number;
  updateList: (list: List) => void;
  deleteList: () => void;
  cloneList: (list: List) => void;
  goToResource: (resource: Resource) => void;
  goToQuery: (list: List) => void;
  getFilePreview: (selfUrl: string) => Promise<NexusFile>;
  queryResources: (
    id: string,
    paginationSettings: PaginationSettings,
    query?: FilterQuery
  ) => void;
}

const QueryContainer: React.FunctionComponent<QueryContainerProps> = props => {
  const {
    list: { name, id, results, query },
    queryResources,
    pageSize: size,
  } = props;
  React.useEffect(() => {
    handleRefreshList();
  }, [query && query.textQuery, query && query.filters]);

  const handleRefreshList = () => {
    queryResources(id, { size, from: 0 }, query);
  };

  const next = () => {
    const paginationSettings =
      results && !!results.data
        ? { size, from: results.data.resources.index + 1 * size }
        : { size, from: 0 };
    queryResources(id, paginationSettings);
  };

  return <QueryComponent {...{ ...props, next, handleRefreshList }} />;
};

export default QueryContainer;
