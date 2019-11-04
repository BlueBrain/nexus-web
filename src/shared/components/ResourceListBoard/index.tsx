import * as React from 'react';
import { Icon } from 'antd';

import './ListBoard.less';

const ResourceListBoardComponent: React.FunctionComponent<{
  createList(): void;
}> = props => {
  const { createList, children } = props;
  return (
    <div className="list-board">
      <div className="wrapper">
        {children}
        <div className="resource-list -add" onClick={() => createList()}>
          <Icon type="plus" /> Add another resource list
        </div>
      </div>
    </div>
  );
};

export default ResourceListBoardComponent;
