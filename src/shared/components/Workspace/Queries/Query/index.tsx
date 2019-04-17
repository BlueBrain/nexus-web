import * as React from 'react';
import { List } from '../../../../store/reducers/lists';
import './query-component.less';
import { PaginationSettings } from '@bbp/nexus-sdk';
import {
  FilterQuery,
  queryResources,
} from '../../../../store/actions/queryResource';

interface QueryComponentProps extends List {}

const QueryComponent: React.FunctionComponent<QueryComponentProps> = props => {
  const { name } = props;
  console.log({ props });
  return <div className="query-component">{name}</div>;
};

interface QueryContainerProps extends List {
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
    console.log('please query');
    queryResources(id, {
      from: 0,
      size: 20,
    });
  }, []);
  return <QueryComponent {...props} />;
};

export default QueryContainer;
