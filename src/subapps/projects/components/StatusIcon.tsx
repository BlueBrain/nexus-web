import * as React from 'react';
import progressIcon from '../../../shared/images/progressIcon.svg';
import blockedIcon from '../../../shared/images/blockedStatus.svg';
import todoIcon from '../../../shared/images/todoStatus.svg';
import doneIcon from '../../../shared/images/done.svg';
import progressIconMini from '../../../shared/images/progressIconMini.svg';
import blockedIconMini from '../../../shared/images/blockedIconMini.svg';
import doneIconMini from '../../../shared/images/doneIconMini.svg';

import { Status } from '../types';

const StatusIcon: React.FC<{
  status: Status;
  mini?: boolean;
}> = ({ status, mini }) => {
  let icon;

  switch (status) {
    case Status.inProgress:
      icon = mini ? progressIconMini : progressIcon;
      break;
    case Status.blocked:
      icon = mini ? blockedIconMini : blockedIcon;
      break;
    case Status.toDo:
      icon = todoIcon;
      break;
    case Status.done:
      icon = mini ? doneIconMini : doneIcon;
      break;
    default:
      icon = todoIcon;
  }

  return <img src={icon} width={mini ? '18px' : '35px'} />;
};

export default StatusIcon;
