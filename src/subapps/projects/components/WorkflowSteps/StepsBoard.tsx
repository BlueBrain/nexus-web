import * as React from 'react';

import './StepsBoard.less';

const StepsBoard: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className="steps-board">{children}</div>;
};

export default StepsBoard;
