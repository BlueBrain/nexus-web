import * as React from 'react';
import { PlusOutlined } from '@ant-design/icons';

import './ListBoard.scss';

const ResourceListBoardComponent: React.FunctionComponent<{
  createList(): void;
}> = props => {
  const { createList, children } = props;
  return (
    <>
      {children}
      <div className="resource-list -add" onClick={() => createList()}>
        <PlusOutlined /> Add another resource list
      </div>
    </>
  );
};

export default ResourceListBoardComponent;
