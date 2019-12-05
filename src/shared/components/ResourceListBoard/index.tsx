import * as React from 'react';
import { Icon } from 'antd';

import './ListBoard.less';

const ResourceListBoardComponent: React.FunctionComponent<{
  createList(): void;
}> = props => {
  const { createList, children } = props;
  return (
    <>
      {children}
      <div className="resource-list -add" onClick={() => createList()}>
        <Icon type="plus" /> Add another resource list
      </div>
    </>
  );
};

export default ResourceListBoardComponent;
