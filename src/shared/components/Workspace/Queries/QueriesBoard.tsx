import * as React from 'react';
import { QueriesContainerProps } from './QueriesContainer';
import Query from './Query';
import './queries-board.less';
import { List } from '../../../store/reducers/lists';
import { Icon } from 'antd';

interface QueriesComponentProps extends QueriesContainerProps {}

const QueriesComponent: React.FunctionComponent<
  QueriesComponentProps
> = props => {
  const {
    lists,
    queryResources,
    goToResource,
    goToQuery,
    updateList,
    deleteList,
    cloneList,
    createList,
  } = props;
  return (
    <div className="queries-board">
      {lists.map((list: List, index: number) => {
        return (
          <Query
            {...{
              list,
              queryResources,
              goToResource,
              goToQuery,
              updateList: (list: List) => updateList(index, list),
              deleteList: () => deleteList(index),
              cloneList: (list: List) => cloneList(index, list),
            }}
            key={list.id}
          />
        );
      })}
      <div className="query-component -add" onClick={() => createList()}>
        <Icon type="plus" /> Add another query list
      </div>
    </div>
  );
};

export default QueriesComponent;
