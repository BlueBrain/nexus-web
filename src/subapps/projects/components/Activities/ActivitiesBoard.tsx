import * as React from 'react';

import './ActivitiesBoard.less';

const ActivitiesBoard: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className="activities-board">{children}</div>;
};

export default ActivitiesBoard;
