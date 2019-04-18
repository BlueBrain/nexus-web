import * as React from 'react';
import { PaginationSettings, Resource } from '@bbp/nexus-sdk';
import { FilterQuery } from '../../../../store/actions/queryResource';
import { List } from '../../../../store/reducers/lists';
import QueryComponent from './QueryComponent';

interface QueryContainerProps extends List {
  goToResource: (resource: Resource) => void;
  queryResources: (
    id: string,
    paginationSettings: PaginationSettings,
    query?: FilterQuery
  ) => void;
}

const QueryContainer: React.FunctionComponent<QueryContainerProps> = props => {
  const { name, id, results, queryResources } = props;
  console.log({ results });
  React.useEffect(() => {
    // TODO do something not to query each time
    const size = 20;
    queryResources(id, { size, from: 0 });
  }, []);

  const next = () => {
    const size = 20;
    const paginationSettings =
      results && !!results.data
        ? { size, from: results.data.resources.index + 1 * size }
        : { size, from: 0 };
    queryResources(id, paginationSettings);
  };

  return <QueryComponent {...{ ...props, next }} />;
};

export default QueryContainer;
