import * as React from 'react';
import { PaginationSettings, Resource } from '@bbp/nexus-sdk';
import { FilterQuery } from '../../../../store/actions/queryResource';
import { List } from '../../../../store/reducers/lists';
import QueryComponent from './QueryComponent';

interface QueryContainerProps {
  list: List;
  updateList: (list: List) => void;
  deleteList: () => void;
  cloneList: (list: List) => void;
  goToResource: (resource: Resource) => void;
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
  } = props;
  React.useEffect(() => {
    console.log('updating refresh list normal', query);
    // TODO do something not to query each time
    handleRefreshList();
  }, [query && query.textQuery]);

  const handleRefreshList = () => {
    const size = 20;
    queryResources(id, { size, from: 0 }, query);
  };

  const next = () => {
    const size = 20;
    const paginationSettings =
      results && !!results.data
        ? { size, from: results.data.resources.index + 1 * size }
        : { size, from: 0 };
    console.log('next', { paginationSettings });
    queryResources(id, paginationSettings);
  };

  return <QueryComponent {...{ ...props, next }} />;
};

export default QueryContainer;
