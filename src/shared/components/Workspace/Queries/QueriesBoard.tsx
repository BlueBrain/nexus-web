import * as React from 'react';
import { QueriesContainerProps } from './QueryContainer';
import Query from './Query';
import './queries-board.less';
import { List } from '../../../store/reducers/lists';

interface QueriesComponentProps extends QueriesContainerProps {}

const QueriesComponent: React.FunctionComponent<
  QueriesComponentProps
> = props => {
  const {
    lists,
    queryResources,
    goToResource,
    updateList,
    deleteList,
    cloneList,
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
              updateList: (list: List) => updateList(index, list),
              deleteList: () => deleteList(index),
              cloneList: (list: List) => cloneList(index, list),
            }}
            key={list.id}
          />
        );
      })}
    </div>
  );
};

export default QueriesComponent;
